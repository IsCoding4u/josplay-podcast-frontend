import time
import uuid
import os
from datetime import datetime, timezone
 
import feedparser
import requests
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, EmailStr
from pymongo import MongoClient
from typing import Optional
 
from rss_ingest import ingest_podcast
from rss_parser import validate_rss_url
 
 
 
app = FastAPI()
 
client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]
 
 
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
 
def get_admin_api_key(
    x_admin_api_key: str | None = Header(default=None, alias="x-Admin-API-key"),
) -> str:
    expected_api_key = os.getenv("ADMIN_API_KEY")
    if not expected_api_key or x_admin_api_key is None or x_admin_api_key != expected_api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing admin API key")
    return x_admin_api_key
 
 
 
class SubmissionCreate(BaseModel):
    first_name: str
    last_name: str
    rss_url: HttpUrl
    contact_email: EmailStr
    podcast_name: Optional[str] = None
    country: Optional[str] = None
    language: Optional[str] = None
    notes: Optional[str] = None
 

 
def check_feed_health(rss_url: str) -> dict:
    start = time.time()
    try:
        response = requests.get(rss_url, timeout=30,headers={"User-Agent": "JosplayPodcastBot/1.0"},)
        duration = (time.time() - start) * 1000
 
        if response.status_code != 200:
            return {
                "status": "broken",
                "error": f"HTTP {response.status_code}",
                "response_time": duration,
            }
 
        feed = feedparser.parse(response.content)
        if feed.bozo:
            return {
                "status": "degraded",
                "error": "Malformed XML",
                "response_time": duration,
            }
 
        return {"status": "healthy", "error": None, "response_time": duration}
 
    except Exception as e:
        return {"status": "broken", "error": str(e), "response_time": None}
 
 
 
@app.post("/submissions")
def create_submission(payload: SubmissionCreate):
    rss_url = str(payload.rss_url).strip()
 
    
    try:
        validate_rss_url(rss_url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
 
    
    if db.submission.find_one({"rss_url": rss_url}) or db.podcast.find_one({"rss_url": rss_url}):
        raise HTTPException(status_code=409, detail="This RSS feed has already been submitted")
 
   
    try:
        feed_response = requests.get(
            rss_url,
            timeout=30,
            headers={"User-Agent": "JosplayPodcastBot/1.0"},
        )
        feed = feedparser.parse(feed_response.content)
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="RSS feed took too long to respond. The feed may be slow or temporarily unavailable — try again shortly.",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach RSS feed: {str(e)}")
 
    if feed.bozo:
        raise HTTPException(status_code=400, detail="Malformed RSS feed")
 
    podcast_name = payload.podcast_name or feed.feed.get("title")
    if not podcast_name:
        raise HTTPException(status_code=400, detail="Podcast name could not be derived from feed; please provide it manually")
 

    submission_doc = {
        "uuid": str(uuid.uuid4()),
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "rss_url": rss_url,
        "contact_email": str(payload.contact_email).lower(),
        "podcast_name": podcast_name.strip(),
        "country": payload.country,
        "language": payload.language or feed.feed.get("language", "en"),
        "notes": payload.notes,
        "status": "pending_review",
        "created_at": datetime.now(timezone.utc),


        "feed_details": {
            "title": feed.feed.get("title"),
            "description": feed.feed.get("description"),
            "language": feed.feed.get("language"),
            "episodes": [
                {
                    "title": e.get("title"),
                    "description": e.get("description"),
                    "audio_url": (
                        e.get("enclosures")[0].get("url")
                        if e.get("enclosures")
                        else None
                    ),
                    "guid": e.get("id"),
                    "published_at": e.get("published"),
                }
                for e in feed.entries
            ],
        },
    }
 
    for field in ("country", "language", "notes"):
        if submission_doc[field] is None:
            del submission_doc[field]
 
    db.submission.insert_one(submission_doc)
 
    return {
        "message": "Your podcast has been submitted for editorial review.",
        "podcast_title": podcast_name,
        "episodes_found": len(submission_doc["feed_details"]["episodes"]),
    }
 
 
 
@app.get("/submissions/pending")
def get_pending_submissions(admin_api_key: str = Depends(get_admin_api_key)):
    data = list(db.submission.find({"status": "pending_review"}))
    for d in data:
        d["_id"] = str(d["_id"])
    return data
 
 
 
@app.get("/submissions/{submission_id}")
def get_submission(submission_id: str):
    sub = db.submission.find_one({"uuid": submission_id})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub["_id"] = str(sub["_id"])
    return sub
 
 
 
@app.post("/admin/approve/{submission_id}")
def approve_submission(
    submission_id: str, admin_api_key: str = Depends(get_admin_api_key)
):
    sub = db.submission.find_one({"uuid": submission_id})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
 
    existing = db.podcast.find_one({"rss_url": sub["rss_url"]})
    if existing:
        return {"message": "Already approved", "uuid": existing["uuid"]}
 
    podcast_doc = {
        "uuid": str(uuid.uuid4()),
        "title": sub["podcast_name"],
        "rss_url": sub["rss_url"],
        "language": sub.get("language", "en"),
        "status": "active",
        "health_status": "healthy",
        "poll_frequency": 3600,
        "failure_count": 0,
        "last_polled_at": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
 
    podcast_id = db.podcast.insert_one(podcast_doc).inserted_id
 

    for ep in sub.get("feed_details", {}).get("episodes", []):
        if not ep.get("title"):
            continue
        try:
            db.episode.insert_one(
                {
                    "uuid": str(uuid.uuid4()),
                    "podcast_id": podcast_id,
                    "title": ep.get("title"),
                    "description": ep.get("description"),
                    "audio_url": ep.get("audio_url"),
                    "guid": ep.get("guid"),
                    "published_at": ep.get("published_at"),
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc),
                }
            )
        except Exception as e:
            print(f"Episode skipped during approval seed: {e}")
 
    db.submission.update_one(
        {"uuid": submission_id},
        {"$set": {"status": "approved", "reviewed_at": datetime.now(timezone.utc)}},
    )
 
    try:
        ingest_podcast(sub["rss_url"])
    except Exception as e:
        print(f"Post-approval ingest warning: {e}")
 
    return {"message": "Approved", "uuid": podcast_doc["uuid"]}
 

 
@app.post("/admin/reject/{submission_id}")
def reject_submission(
    submission_id: str, admin_api_key: str = Depends(get_admin_api_key)
):
    result = db.submission.update_one(
        {"uuid": submission_id},
        {"$set": {"status": "rejected", "reviewed_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"status": "rejected"}
 
 
 
@app.get("/podcasts")
def get_podcasts():
    data = list(db.podcast.find({}, {"_id": 0}))
    return data
 

 
@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    podcast = db.podcast.find_one({"uuid": podcast_id})
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
 
    eps = list(db.episode.find({"podcast_id": podcast["_id"]}))
    for e in eps:
        e["_id"] = str(e["_id"])
        e["podcast_id"] = str(e["podcast_id"])
 
    podcast["_id"] = str(podcast["_id"])
    podcast["episodes"] = eps
    return podcast
 
 
 
@app.post("/podcasts/{podcast_id}/check-health")
def check_health(
    podcast_id: str, admin_api_key: str = Depends(get_admin_api_key)
):
    podcast = db.podcast.find_one({"uuid": podcast_id})
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
 
    result = check_feed_health(podcast["rss_url"])
 
    db.podcast.update_one(
        {"uuid": podcast_id},
        {
            "$set": {
                "health_status": result["status"],
                "last_checked_at": datetime.now(timezone.utc),
                "response_time_ms": result["response_time"],
                "error_message": result["error"],
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
 
    return result
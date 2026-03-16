from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel, HttpUrl, EmailStr
from rss_ingest import ingest_podcast
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import uuid
from datetime import datetime, timezone
import os


app = FastAPI()

client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]


def get_admin_api_key(x_admin_api_key: str = Header(alias="x-Admin-API-key")) -> str:

    expected_api_key = os.getenv("ADMIN_API_KEY")
    if not expected_api_key or x_admin_api_key != expected_api_key:
        raise HTTPException(status_code=401,detail="Invalid or missing admin API key")
    return x_admin_api_key


origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class SubmissionCreate(BaseModel):
    first_name: str
    last_name: str
    rss_url: HttpUrl
    contact_email: EmailStr
    podcast_name: str | None = None
    country: str | None = None
    language: str | None = None
    notes: str | None = None


@app.post("/submissions")
def create_submission(payload: SubmissionCreate):
    
    submission_doc = {
        "uuid": str(uuid.uuid4()),
        "first_name": payload.first_name,
        "last_name": payload.last_name,
        "rss_url": str(payload.rss_url),
        "contact_email": payload.contact_email,
        "status": "pending_review",
        "created_at": datetime.now(timezone.utc)
    }
    for field in ("podcast_name", "country","language", "notes"):
         value = getattr(payload, field)
         if value is not None:
             submission_doc[field] = value
             
    db.submission.insert_one(submission_doc)

    result = ingest_podcast(str(payload.rss_url))

    return {
        "message": "Submission received",
        "podcast_ingested": result
    }



@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    podcast = db.podcast.find_one({"uuid": podcast_id}, {"_id":0})

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    return podcast


@app.post("/admin/approve/{submission_id}")
def approve_submission(submission_id: str, admin_api_key: str = Depends(get_admin_api_key)):
    result = db.submission.update_one(
        {"uuid": submission_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc)
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404,detail="Submission not found")
    return {"status": "approved"}


@app.post("/admin/reject/{submission_id}")
def reject_submission(submission_id: str, admin_api_key: str = Depends(get_admin_api_key)):
    result = db.submission.update_one(
        {"uuid": submission_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc)
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404,detail="Submission not found")
    return {"status": "rejected"}

    # to test use uvicorn app:app -- reload
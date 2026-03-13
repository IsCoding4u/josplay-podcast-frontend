from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl, EmailStr
from rss_ingest import ingest_podcast
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import uuid
from datetime import datetime, timezone


app = FastAPI()

client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]


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
        "podcast_name": payload.podcast_name,
        "country": payload.country,
        "language": payload.language,
        "notes": payload.language,
        "status": "pending_review",
        "created_at": datetime.now(timezone.utc)
    }
    db.submission.insert_one(submission_doc)

    result =ingest_podcast(str(payload.rss_url))

    return {
        "message": "Submission received",
        "podcast_ingested": result
    }



@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    podcast = db.podcast.find_one({"uuid": podcast_id})

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    
    return podcast


@app.post("/admin/approve/{submission_id}")
def approve_submission(submission_id: str):
    db.submission.update_one(
        {"uuid": submission_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc)
            }
        }
    )
    return {"status": "approved"}


@app.post("/admin/reject/{submission_id}")
def reject_submission(submission_id: str):
    db.submission.update_one(
        {"uuid": submission_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc)
            }
        }
    )
    return {"status": "rejected"}

    # to test use uvicorn app:app -- reload
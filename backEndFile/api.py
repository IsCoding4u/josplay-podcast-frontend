from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl, EmailStr


app = FastAPI()


class SubmissionCreate(BaseModel):
    rss_url: HttpUrl
    contact_email: EmailStr
    podcast_name: str | None = None
    country: str | None = None
    language: str | None = None
    notes: str | None = None


@app.post("/submissions")
def create_submission(payload: SubmissionCreate):
    return {"message": "Submission received"}


@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    return {"podcast_id": podcast_id}


@app.post("/admin/approve/{submission_id}")
def approve_submission(submission_id: str):
    return {"status": "approved"}
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl, EmailStr
from rss_ingest import ingest_podcast
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origin=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SubmissionCreate(BaseModel):
    rss_url: HttpUrl
    contact_email: EmailStr
    podcast_name: str | None = None
    country: str | None = None
    language: str | None = None
    notes: str | None = None


@app.post("/submissions")
def create_submission(payload: SubmissionCreate):
    print(payload)

    
    _rss_url = payload.rss_url
    print(_rss_url)
    result = ingest_podcast(f"{_rss_url}")
    print(result)
    return {"message": "Submission received", "data": result}


@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    return {"podcast_id": podcast_id}


@app.post("/admin/approve/{submission_id}")
def approve_submission(submission_id: str):
    return {"status": "approved"}

    # to test use uvicorn app:app -- reload
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl, EmailStr
from rss_parser import fetch_feed, parse_feed, extract_episode, RSSFetchError, RSSParseError, InvalidURLError
from datetime import datetime, timezone

app = FastAPI(title="Josplay Podcast API")

# ----- In-memory storage for demo -----
pending_submissions = {}
podcasts_store = {}

# ----- Pydantic models -----
class SubmissionCreate(BaseModel):
    rss_url: HttpUrl
    contact_email: EmailStr
    podcast_name: str | None = None
    country: str | None = None
    language: str | None = None
    notes: str | None = None

# ----- API Endpoints -----
@app.post("/submissions")
def create_submission(payload: SubmissionCreate):
    uuid = str(len(pending_submissions) + 1)
    pending_submissions[uuid] = payload.dict()
    return {"message": "Submission received", "uuid": uuid}

@app.get("/submissions/pending")
def get_pending_submissions():
    return list(pending_submissions.values())

@app.post("/admin/approve/{submission_id}")
def approve_submission(submission_id: str):
    submission = pending_submissions.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Fetch RSS feed to validate and extract episodes
    try:
        content, _, _ = fetch_feed(submission["rss_url"])
        feed = parse_feed(content)
        episodes = extract_episode(feed)
    except (RSSFetchError, RSSParseError, InvalidURLError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    podcast_id = str(len(podcasts_store) + 1)
    podcasts_store[podcast_id] = {
        **submission,
        "id": podcast_id,
        "episodes": episodes,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    del pending_submissions[submission_id]

    return {"status": "approved", "podcast_id": podcast_id}

@app.get("/podcasts/{podcast_id}")
def get_podcast(podcast_id: str):
    podcast = podcasts_store.get(podcast_id)
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    return podcast
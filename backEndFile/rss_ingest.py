import requests
import feedparser
import uuid
from datetime import datetime, timezone
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]


def ingest_podcast(rss_url: str):
    headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"
}

    response = requests.get(rss_url, headers=headers, timeout=10)

    feed = feedparser.parse(response.content)



    podcast_doc = {
        "uuid": str(uuid.uuid4()),
        "title": feed.feed.get("title") or "This is not a real Podcast",
        "rss_url": rss_url,
        "language": feed.feed.get("language", "en") or "Language unknown", 
        "status": "active",
        "health_status": "healthy",
        "poll_frequency": 3600,
        "failure_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    existing = db.podcast.find_one({"rss_url": rss_url})

    if existing:
        podcast_id = existing["_id"]
        print("podcast_id existing")
    else:
        podcast_id = db.podcast.insert_one(podcast_doc).inserted_id
        print("Podcast inserted")
    


    for entry in feed.entries:

        episode_doc = {
            "uuid": str(uuid.uuid4()),
            "podcast_id": podcast_id,
            "title": entry.get("title"),
            "description": entry.get("summary"),
            "audio_url": entry.enclosures[0]["href"] if entry.get("enclosures") else None,
            "guid": entry.get("id"),
            "published_at": datetime(*entry.published_parsed[:6]) if entry.get("published_parsed") else None,
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
            
        }

        try:
            db.episode.insert_one(episode_doc)
        except Exception as e:
            print("Episode skipped:", e)

    print("Episodes ingested")

    return podcast_doc
     
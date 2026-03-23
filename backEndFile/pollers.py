import logging
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from pymongo import MongoClient
import uuid


from rss_parser import fetch_feed, parse_feed, extract_episode, RSSFetchError, RSSParseError

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s",)
log = logging.getLogger(__name__)

client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]

CIRCUIT_BREAKER_THRESHOLD = 5


def poll_podcast(podcast: dict):
    podcast_id = podcast["_id"]
    rss_url = podcast["rss_url"]
    title = podcast.get("title", rss_url)

    log.info(f"Polling: {title}")

    try:
        content, new_etag, new_last_modified = fetch_feed(
            url=rss_url,
            etag=podcast.get("etag"),
            last_modified=podcast.get("last_modified"),
        )

    except RSSFetchError as e:
        _handle_failure(podcast, str(e))
        return
    except Exception as e:
        _handle_failure(podcast, f"Unexpected fetch error: {str(e)}")
        return
 
    
    if content is None:
        log.info(f"  304 Not Modified — skipping: {title}")
        db.podcast.update_one(
            {"_id": podcast_id},
            {"$set": {"last_polled_at": datetime.now(timezone.utc)}}
        )
        return
    
    try: 
        feed = parse_feed(content)
    except RSSParseError as e:
        _handle_failure(podcast, f"Parse error: {str(e)}")
        return
    
    try:
        _ingest_episodes(podcast_id, feed)
    except Exception as e:
        _handle_failure(podcast, f"Ingest error: {str(e)}")
        return
    
    parse_last_modified = None
    if new_last_modified:
        try:
            parse_last_modified = parsedate_to_datetime(new_last_modified)
        except Exception:
            parsed_last_modified = None           



    db.podcast.update_one(
        {"_id": podcast_id},
        {
            "$set": {
                "last_polled_at": datetime.now(timezone.utc),
                "etag": new_etag,
                "last_modified": parse_last_modified,
                "failure_count": 0,
                "health_status": "healthy",
                "updated_at": datetime.now(timezone.utc),
            }
        }
    )

    log.info(f" Done: {title}")

def _ingest_episodes(podcast_id, feed):
    episodes = extract_episode(feed)

    feed_guids = set()

    for ep in episodes:
        guid = ep["guid"]
        feed_guids.add(guid)

        existing = db.episode.find_one({"podcast_id": podcast_id, "guid": guid})
        if existing is None:
            db.episode.insert_one({
                "uuid": str(uuid.uuid4()),
                "podcast_id": podcast_id,
                **ep,
            })
            log.info(f" New episode: {ep.get("title", guid)}")

        else:
            changed_fields = {}

            for field in ("title", "description", "audio_url", "duration",
                          "published_at", "explicit", "season_number", "episode_number"):
                new_val = ep.get(field)
                old_val = existing.get(field)
                if new_val is not None and new_val != old_val:
                    changed_fields[field] = new_val
                
            if changed_fields:
                changed_fields["updated_at"] = datetime.now(timezone.utc)
                db.episode.update_one(
                    {"_id": existing["_id"]},
                    {"$set": changed_fields}
                )
                log.info(f"    Updated episode: {ep.get('title', guid)}")
 
    
    db.episode.update_many(
        {
            "podcast_id": podcast_id,
            "guid": {"$nin": list(feed_guids)},
            "is_active": True,
        },
        {"$set": {"is-active": False, "updated_at": datetime.now(timezone.utc)}}
    )

    def _handle_failure(podcast: dict, reason: str):
        podcast_id = podcast["_id"]
        title = podcast.get("title", podcast["rss_url"])
        new_failure_count = podcast.get("failure_count", 0) + 1

        log.warning(f" Poll failed for '{title}': {reason} (failure #{new_failure_count})")

        if new_failure_count >= CIRCUIT_BREAKER_THRESHOLD:
            health_status = "broken"
            new_status = "paused"
            log.error(
                f"  Circuit breaker tripped for '{title}' after {new_failure_count} "
            f"consecutive failures. Auto-pausing."
            )
        else:
            health_status = "degraded"
            new_status = podcast.get("status", "active")

        db.podcast.update_one(
            {"_id": podcast_id},
            {
                "$set": {
                    "failure_count": new_failure_count,
                    "health_status": health_status,
                    "status": new_status,
                    "last_poll_error": reason,
                    "last_polled_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                }
            }
        )

def run_due_polls():
    now = datetime.now(timezone.utc)
    active_podcasts = list(db.podcast.find({"status": "active"}))

    due = []

    for podcast in active_podcasts:
        last_polled = podcast.get("last_polled_at")
        poll_frequency = podcast.get("poll_frequency", 3600)

        if last_polled is None:
            due.append(podcast)
        else:
            next_poll_due = last_polled + timedelta(seconds=poll_frequency)
            if now >= next_poll_due:
                due.append(podcast)
    if not due:
        log.info("No podcasts due for polling")
        return
    log.info(f"{len(due)} podcast due for polling.")

    for podcast in due:
        try: 
            poll_podcast(podcast)
        except Exception as e:
            
            log.error(f"Unhandled error polling '{podcast.get('title')}': {e}")

if __name__ == "__main__":
    log.info("Josplay RSS Poller starting")

    scheduler = BlockingScheduler(timezone="UTC")

    scheduler.add_job(run_due_polls, "interval", seconds=60, id="rss_poller")
    log.info("Scheduler running")

    try:
        scheduler.start()
    except KeyboardInterrupt:
        log.info("Poller stopped.")

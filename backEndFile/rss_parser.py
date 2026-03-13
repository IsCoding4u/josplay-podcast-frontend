import feedparser
import requests
import bleach
import socket
import ipaddress

from hashlib import sha256
from urllib.parse import urlparse
from datetime import datetime, timezone
from dateutil import parser as date_parser



class RSSFetchError(Exception):
    pass


class RSSParseError(Exception):
    pass


class InvalidURLError(Exception):
    pass




def validate_rss_url(url: str):
    parsed = urlparse(url)

    if parsed.scheme != "https":
        raise InvalidURLError("Only HTTPS RSS feeds are allowed")

    if not parsed.hostname:
        raise InvalidURLError("Invalid RSS URL")

    try:
        ip = socket.gethostbyname(parsed.hostname)
        ip_obj = ipaddress.ip_address(ip)

        if (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_reserved
            or ip_obj.is_link_local
        ):
            raise InvalidURLError("Private/internal IP addresses are not allowed")

    except Exception:
        raise InvalidURLError("Unable to validate RSS host")

    return True



def fetch_feed(
    url: str,
    timeout: int = 10,
    etag: str | None = None,
    last_modified: str | None = None,
):
    validate_rss_url(url)

    headers = {
        "User-Agent": "JosplayPodcastBot/1.0"
    }

    if etag:
        headers["If-None-Match"] = etag

    if last_modified:
        headers["If-Modified-Since"] = last_modified

    try:
        response = requests.get(url, headers=headers, timeout=timeout)
    except requests.RequestException as e:
        raise RSSFetchError(f"Network error: {str(e)}")

    if response.status_code == 304:
       
        return None, etag, last_modified

    if response.status_code != 200:
        raise RSSFetchError(f"HTTP {response.status_code}")

    response.encoding = response.apparent_encoding

    return (
        response.content,
        response.headers.get("ETag"),
        response.headers.get("Last-Modified"),
    )



def parse_feed(content: bytes):
    feed = feedparser.parse(content)

    if feed.bozo:
        raise RSSParseError("RSS feed Malformed")

    if not feed.feed.get("title"):
        raise RSSParseError("Missing required channel title")

    return feed



def extract_artwork(channel: dict):
    if "image" in channel and isinstance(channel["image"], dict):
        return channel["image"].get("href")

    if "itunes_image" in channel:
        image = channel.get("itunes_image")
        if isinstance(image, dict):
            return image.get("href")
        return image

    return None


def extract_podcast_metadata(feed):
    channel = feed.feed

    return {
        "title": channel.get("title"),
        "description": sanitize_html(channel.get("description")),
        "artwork_url": extract_artwork(channel),
        "language": channel.get("language"),
        "explicit": channel.get("itunes_explicit") == "yes",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }




def normalize_duration(value):
    if not value:
        return None

    if isinstance(value, int):
        return value

    try:
        value = str(value).strip()

        if ":" in value:
            parts = [int(p) for p in value.split(":")]

            if len(parts) == 3:
                return parts[0] * 3600 + parts[1] * 60 + parts[2]

            if len(parts) == 2:
                return parts[0] * 60 + parts[1]

        return int(value)

    except Exception:
        return None


def sanitize_html(text: str | None):
    if not text:
        return None

    return bleach.clean(text, strip=True)


def generate_fallback_guid(entry):
    base = (
        entry.get("title", "")
        + entry.get("published", "")
        + entry.get("link", "")
    ).encode()

    return sha256(base).hexdigest()




def extract_episode(feed):
    episode = []

    for entry in feed.entries:

        guid = (
            entry.get("guid")
            or entry.get("id")
            or entry.get("link")
            or generate_fallback_guid(entry)
        )

        
        audio_url = None
        for enclosure in entry.get("enclosures", []):
            if enclosure.get("type", "").startswith("audio"):
                audio_url = enclosure.get("href")
                break

        
        if not audio_url:
            continue

        
        try:
            published_at = (
                date_parser.parse(entry.get("published"))
                if entry.get("published")
                else None
            )
        except Exception:
            published_at = None
            

        episode.append({
            "guid": guid,
            "title": entry.get("title"),
            "description": sanitize_html(
                entry.get("summary") or entry.get("description")
            ),
            "audio_url": audio_url,
            "duration": normalize_duration(
                entry.get("itunes_duration")
            ),
            "published_at": published_at,
            "explicit": entry.get("itunes_explicit") == "yes",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "is_active": True,
        })

    return episode
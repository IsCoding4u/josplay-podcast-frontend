import pytest
from rss_parser import validate_rss_url, fetch_feed, parse_feed, extract_podcast_metadata, extract_episode

RSS_URL = "https://www.africanews.com/feed/rss"

def test_validate_rss_url():
    assert validate_rss_url(RSS_URL) == True

def test_fetch_feed():
    content, etag, last_modified = fetch_feed(RSS_URL)

    assert content is not None
    assert isinstance(content, bytes)

def test_parse_feed():
    content, etag, last_modified = fetch_feed(RSS_URL)
    feed = parse_feed(content)

    assert feed.feed.get("title") is not None
    assert len(feed.entries) > 0

def test_extract_metadata():
    content, etag, last_modified = fetch_feed(RSS_URL)
    feed = parse_feed(content)

    metadata = extract_podcast_metadata(feed)

    assert metadata["title"] is not None
    assert metadata["created_at"] is not None

# def test_extract_episode():
#     content, etag, last_modified = fetch_feed(RSS_URL)
#     feed = parse_feed(content)

    
    




    
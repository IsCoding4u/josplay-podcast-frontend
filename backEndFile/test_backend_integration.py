from rss_parser import fetch_feed, parse_feed, extract_episode

sample_rss_url = "https://feeds.simplecast.com/54nAGcIl"  # Replace with any RSS feed you want to test

try:
    content, etag, last_modified = fetch_feed(sample_rss_url)
    feed = parse_feed(content)
    episodes = extract_episode(feed)
    print(f"Fetched {len(episodes)} episodes")
    for ep in episodes[:3]:  # show first 3 episodes
        print(ep["title"], ep["audio_url"])
except Exception as e:
    print("Error:", e)
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["Josplay-Capstonedb"]


def create_collections():

    collections = db.list_collection_names()
    if "podcast" not in collections:

    # PODCAST 
        podcast_validator ={
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["uuid", "title", "rss_url", "status", "created_at"],
                "properties": {
                    "uuid": {"bsonType": "string"},
                    "title": {"bsonType": "string"},
                    "description": {"bsonType": "string"},
                    "rss_url": {"bsonType": "string"},
                    "artwork_url": {"bsonType": "string"},
                    "language": {"bsonType": "string"},
                    "regions": {
                        "bsonType": "array",
                        "items": {"bsonType": "string"}
                    },
                    "themes": {
                        "bsonType": "array",
                        "items": {"bsonType": "string"}
                    },
                    "explicit": {"bsonType": "bool"},
                    "status": {
                        "enum": ["active", "paused", "suspended"]
                    },
                    "poll_frequency": {"bsonType": "int"},
                    "last_polled_at": {
                        "bsonType": ["date", "null"]
                    },
                    "etag": {
                        "bsonType": ["string", "null"]
                    },
                    "last_modified": {
                        "bsonType": ["date", "null"]
                    },
                    "failure_count": {"bsonType": "int"},
                    "health_status": {
                        "enum": ["healthy", "degraded", "broken"]
                    },
                    "created_at": {"bsonType": "date"},
                    "updated_at": {"bsonType": "date"}
                }
            }
        }
        db.create_collection("podcast", validator=podcast_validator)
        print("Podcast collection created")
    
    else:
        print("Podcast collection already exists")



    



    # EPISODE
    if "episode" not in collections:


        episode_validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "uuid",
                    "podcast_id",
                    "title",
                    "guid",
                    "created_at"
                ],
                "properties": {
                    "uuid": {"bsonType": "string"},
                    "podcast_id": {"bsonType": "objectId"},
                    "title": {"bsonType": "string"},
                    "description": {"bsonType": "string"},
                    "audio_url": {"bsonType": "string"},
                    "duration": {"bsonType": "int"},
                    "published_at": {"bsonType": "date"},
                    "explicit": {"bsonType": "bool"},
                    "season_number": {"bsonType": "int"},
                    "episode_number": {"bsonType": "int"},
                    "guid": {"bsonType": "string"},
                    "is_active": {"bsonType": "bool"},
                    "created_at": {"bsonType": "date"},
                    "updated_at": {"bsonType": "date"}
                }
            }
        }
        db.create_collection("episode", validator=episode_validator)
        print("Episode collection created")

    else:
        print("Episode collection already exists")
    


    # SUBMISSION

    if "submission" not in collections:

        submission_validator={
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "uuid",
                    "first_name",
                    "last_name",
                    "rss_url",
                    "contact_email",
                    "status",
                    "created_at"
                ],
                "properties": {
                    "uuid": {"bsonType": "string"},
                    "first_name": {"bsonType": "string"},
                    "last_name": {"bsonType": "string"},
                    "rss_url": {"bsonType": "string"},
                    "contact_email": {"bsonType": "string"},
                    "podcast_name": {"bsonType": "string"},
                    "country": {"bsonType": "string"},
                    "language": {"bsonType": "string"},
                    "notes": {"bsonType": "string"},
                    "status": {
                        "enum": ["pending_review", "approved", "rejected"]
                    },
                    "review_notes": {"bsonType": "string"},
                    "created_at": {"bsonType": "date"},
                    "reviewed_at": {
                        "bsonType": ["date", "null"]
                    }
                }
            }
        }
        db.create_collection("submission", validator=submission_validator)
        print("Submission collection created")

    else:
        print("Submission collection already exists")
    


def create_indexes():

    # PODCAST
    db.podcast.create_index("rss_url", unique=True)
    db.podcast.create_index("normalized_rss_url")
    db.podcast.create_index("status")
    db.podcast.create_index("health_status")
    db.podcast.create_index("last_polled_at")


    # EPISODE
    db.episode.create_index(
        [("podcast_id", 1), ("guid", 1)],
        unique=True
    )

    db.episode.create_index("published_at")
    db.episode.create_index("is_active")


    
    db.submission.create_index("rss_url")
    db.submission.create_index("status")
    db.submission.create_index("created_at")





if __name__ == "__main__":
    create_collections()
    create_indexes()
    print("Database setup complete")
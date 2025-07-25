from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["AI_Therapist"]
conversation_collection = db["conversation"]
users_collection = db["user_account"]
blacklist_collection = db["blacklisted_tokens"]

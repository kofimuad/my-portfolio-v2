from pymongo import MongoClient
from os import getenv

MONGODB_URL = getenv("MONGODB_URL")
client = MongoClient(MONGODB_URL)
db = client["portfolio_db"]

# Collections
blogs_collection = db["blogs"]
projects_collection = db["projects"]
about_collection = db["about"]
contacts_collection = db["contacts"]
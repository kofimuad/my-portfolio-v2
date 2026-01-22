from os import getenv
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
MONGODB_URL = getenv("MONGODB_URL")
if not MONGODB_URL:
    raise ValueError("MONGODB_URL not set in environment variables")

# Authentication Configuration
SECRET_KEY = getenv("SECRET_KEY", "your-default-secret-key-change-this")
if SECRET_KEY == "your-default-secret-key-change-this":
    print("WARNING: Using default SECRET_KEY. Please set SECRET_KEY in .env file")

ADMIN_PASSWORD = getenv("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    raise ValueError("ADMIN_PASSWORD not set in environment variables")

# CORS Configuration
FRONTEND_URL = getenv("FRONTEND_URL", "http://localhost:5173")

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = getenv("CLOUDINARY_API_SECRET")

if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
    print("⚠️  WARNING: Cloudinary credentials not fully set. Image uploads may fail.")
    print(f"   CLOUDINARY_CLOUD_NAME: {'SET' if CLOUDINARY_CLOUD_NAME else 'NOT SET'}")
    print(f"   CLOUDINARY_API_KEY: {'SET' if CLOUDINARY_API_KEY else 'NOT SET'}")
    print(f"   CLOUDINARY_API_SECRET: {'SET' if CLOUDINARY_API_SECRET else 'NOT SET'}")

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

print(f"✓ Config loaded successfully")
print(f"✓ MongoDB: {MONGODB_URL[:50]}..." if MONGODB_URL else "✗ MongoDB URL not set")
print(f"✓ Frontend URL: {FRONTEND_URL}")
print(f"✓ Admin Password: {'*' * len(ADMIN_PASSWORD) if ADMIN_PASSWORD else 'NOT SET'}")
print(f"✓ Cloudinary: {'CONFIGURED' if CLOUDINARY_CLOUD_NAME else 'NOT CONFIGURED'}")
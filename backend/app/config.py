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

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

print(f"✓ Config loaded successfully")
print(f"✓ MongoDB: {MONGODB_URL[:50]}..." if MONGODB_URL else "✗ MongoDB URL not set")
print(f"✓ Frontend URL: {FRONTEND_URL}")
print(f"✓ Admin Password: {'*' * len(ADMIN_PASSWORD) if ADMIN_PASSWORD else 'NOT SET'}")
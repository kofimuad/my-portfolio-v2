from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import FRONTEND_URL
from pathlib import Path

# Import routes
from app.routes import blogs, projects, about, contact, auth

app = FastAPI(title="Portfolio API", version="1.0.0")

# Disable automatic trailing slash redirect
app.router.redirect_slashes = False

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "https://mark-agyei.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
def read_root():
    return {
        "message": "Portfolio API is running",
        "status": "ok"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "portfolio-api"
    }

# Include routes FIRST
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["blogs"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(about.router, prefix="/api/about", tags=["about"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])

# Mount static files AFTER routes
Path("uploads").mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from datetime import datetime
from app.database import projects_collection
from app.models import Project, ProjectCreate
from app.auth import verify_token
from typing import Optional
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = "uploads/projects"
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        return token
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

# UPLOAD image (requires auth)
@router.post("/upload")
async def upload_image(file: UploadFile = File(...), token: str = Depends(get_token)):
    """
    Upload an image file for a project.
    Returns the image URL path.
    """
    try:
        print(f"✓ Uploading image with token: {token[:20]}...")
        verify_token(token)
        
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Validate file size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds 5MB limit"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Return the image URL path
        image_url = f"/uploads/projects/{unique_filename}"
        print(f"✓ Image uploaded successfully: {image_url}")
        
        return {"image_url": image_url, "url": image_url}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET all projects (public)
@router.get("/")
def get_projects():
    try:
        projects = list(projects_collection.find().sort("created_at", -1))
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return projects
    except Exception as e:
        print(f"❌ Error fetching projects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET single project (public)
@router.get("/{project_id}")
def get_project(project_id: str):
    try:
        project = projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project["id"] = str(project["_id"])
        del project["_id"]
        return project
    except Exception as e:
        print(f"❌ Error fetching project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# CREATE project (requires auth)
@router.post("/")
def create_project(project: ProjectCreate, token: str = Depends(get_token)):
    try:
        print(f"✓ Creating project with token: {token[:20]}...")
        verify_token(token)
        project_data = project.dict(exclude_none=False)
        print(f"✓ Project data to create: {project_data}")
        project_data["created_at"] = datetime.utcnow()
        project_data["updated_at"] = datetime.utcnow()
        result = projects_collection.insert_one(project_data)
        project_data["id"] = str(result.inserted_id)
        del project_data["_id"]
        print(f"✓ Project created successfully: {project_data['id']}")
        return project_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE project (requires auth)
@router.put("/{project_id}")
def update_project(project_id: str, project: ProjectCreate, token: str = Depends(get_token)):
    try:
        print(f"✓ Updating project {project_id} with token: {token[:20]}...")
        verify_token(token)
        project_data = project.dict(exclude_unset=False)
        print(f"✓ Project data received: {project_data}")
        print(f"✓ Demo link value: '{project_data.get('demo_link')}'")
        project_data["updated_at"] = datetime.utcnow()
        
        # Make sure demo_link is included
        if "demo_link" not in project_data:
            project_data["demo_link"] = project.demo_link or ""
        
        print(f"✓ Final data to save: {project_data}")
        
        result = projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": project_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch and return the updated project
        updated_project = projects_collection.find_one({"_id": ObjectId(project_id)})
        if updated_project:
            updated_project["id"] = str(updated_project["_id"])
            del updated_project["_id"]
            print(f"✓ Project updated successfully: {updated_project}")
            return updated_project
        else:
            print(f"✓ Project updated successfully")
            return {"message": "Project updated successfully"}
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# DELETE project (requires auth)
@router.delete("/{project_id}")
def delete_project(project_id: str, token: str = Depends(get_token)):
    try:
        print(f"✓ Deleting project {project_id} with token: {token[:20]}...")
        verify_token(token)
        result = projects_collection.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        print(f"✓ Project deleted successfully")
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
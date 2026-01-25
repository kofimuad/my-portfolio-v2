from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from bson.objectid import ObjectId
from datetime import datetime
from app.database import projects_collection
from app.models import Project, ProjectCreate
from app.auth import verify_token
from typing import Optional
import os
import cloudinary
import cloudinary.uploader
import cloudinary.api

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

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

def convert_to_object_id(id_str: str) -> ObjectId:
    """Convert string to ObjectId with proper error handling"""
    try:
        return ObjectId(id_str)
    except Exception as e:
        print(f"❌ Invalid ID format: {id_str}")
        raise HTTPException(status_code=400, detail="Invalid ID format")

# UPLOAD image (requires auth)
@router.post("/upload")
async def upload_image(file: UploadFile = File(...), token: str = Depends(get_token)):
    """
    Upload an image file for a project to Cloudinary.
    Returns the image URL.
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
        
        # Read file contents
        contents = await file.read()
        
        # Validate file size
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail="File size exceeds 5MB limit"
            )
        
        # Upload to Cloudinary
        try:
            result = cloudinary.uploader.upload(
                contents,
                folder="portfolio/projects",
                resource_type="auto"
            )
            image_url = result.get('secure_url')
            
            if not image_url:
                raise Exception("No URL returned from Cloudinary")
            
            print(f"✓ Image uploaded successfully to Cloudinary: {image_url}")
            
            return {
                "image_url": image_url,
                "url": image_url
            }
        except Exception as e:
            print(f"❌ Cloudinary upload error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload image to cloud: {str(e)}"
            )
        
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
        object_id = convert_to_object_id(project_id)
        project = projects_collection.find_one({"_id": object_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        project["id"] = str(project["_id"])
        del project["_id"]
        return project
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# CREATE project (requires auth)
@router.post("/")
def create_project(project: ProjectCreate, token: str = Depends(get_token)):
    try:
        print(f"✓ Creating project with token: {token[:20]}...")
        verify_token(token)
        project_data = project.dict(exclude_unset=False)
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
        
        object_id = convert_to_object_id(project_id)
        
        project_data = project.dict(exclude_unset=False)
        print(f"✓ Project data received: {project_data}")
        print(f"✓ Demo link value: '{project_data.get('demo_link')}'")
        project_data["updated_at"] = datetime.utcnow()
        
        # Make sure demo_link is included
        if "demo_link" not in project_data:
            project_data["demo_link"] = project.demo_link or ""
        
        print(f"✓ Final data to save: {project_data}")
        
        result = projects_collection.update_one(
            {"_id": object_id},
            {"$set": project_data}
        )
        
        if result.matched_count == 0:
            print(f"❌ Project not found with ID: {project_id}")
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Fetch and return the updated project
        updated_project = projects_collection.find_one({"_id": object_id})
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
        
        object_id = convert_to_object_id(project_id)
        
        result = projects_collection.delete_one({"_id": object_id})
        if result.deleted_count == 0:
            print(f"❌ Project not found with ID: {project_id}")
            raise HTTPException(status_code=404, detail="Project not found")
        print(f"✓ Project deleted successfully")
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
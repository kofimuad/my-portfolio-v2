from fastapi import APIRouter, HTTPException, Depends
from bson.objectid import ObjectId
from datetime import datetime
from app.database import projects_collection
from app.models import Project, ProjectCreate
from app.auth import verify_token
from typing import Optional

router = APIRouter()

def get_token_optional(token: Optional[str] = None) -> Optional[str]:
    return token

# GET all projects (public)
@router.get("/")
def get_projects():
    try:
        projects = list(projects_collection.find())
        for project in projects:
            project["id"] = str(project["_id"])
            del project["_id"]
        return projects
    except Exception as e:
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
        raise HTTPException(status_code=500, detail=str(e))

# CREATE project (requires auth)
@router.post("/")
def create_project(project: ProjectCreate, token: str = Depends(get_token_optional)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        verify_token(token)
        project_data = project.dict()
        project_data["created_at"] = datetime.utcnow()
        project_data["updated_at"] = datetime.utcnow()
        result = projects_collection.insert_one(project_data)
        project_data["id"] = str(result.inserted_id)
        del project_data["_id"]
        return project_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE project (requires auth)
@router.put("/{project_id}")
def update_project(project_id: str, project: ProjectCreate, token: str = Depends(get_token_optional)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        verify_token(token)
        project_data = project.dict()
        project_data["updated_at"] = datetime.utcnow()
        result = projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": project_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE project (requires auth)
@router.delete("/{project_id}")
def delete_project(project_id: str, token: str = Depends(get_token_optional)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        verify_token(token)
        result = projects_collection.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
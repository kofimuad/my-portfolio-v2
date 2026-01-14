from fastapi import APIRouter, HTTPException, Depends, Header
from bson.objectid import ObjectId
from datetime import datetime
from app.database import about_collection
from app.models import About, AboutBase
from app.auth import verify_token
from typing import Optional

router = APIRouter()

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

# GET about section (public)
@router.get("/")
def get_about():
    try:
        about = list(about_collection.find())
        for item in about:
            item["id"] = str(item["_id"])
            del item["_id"]
        return about
    except Exception as e:
        print(f"❌ Error fetching about: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET single about by id (public)
@router.get("/{about_id}")
def get_about_by_id(about_id: str):
    try:
        about = about_collection.find_one({"_id": ObjectId(about_id)})
        if not about:
            raise HTTPException(status_code=404, detail="About section not found")
        about["id"] = str(about["_id"])
        del about["_id"]
        return about
    except Exception as e:
        print(f"❌ Error fetching about: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# CREATE about section (requires auth)
@router.post("/")
def create_about(about: AboutBase, token: str = Depends(get_token)):
    try:
        print(f"✓ Creating about with token: {token[:20]}...")
        verify_token(token)
        about_data = about.dict()
        about_data["updated_at"] = datetime.utcnow()
        result = about_collection.insert_one(about_data)
        about_data["id"] = str(result.inserted_id)
        del about_data["_id"]
        print(f"✓ About created successfully")
        return about_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating about: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE about section (requires auth)
@router.put("/{about_id}")
def update_about(about_id: str, about: AboutBase, token: str = Depends(get_token)):
    try:
        print(f"✓ Updating about {about_id} with token: {token[:20]}...")
        verify_token(token)
        about_data = about.dict()
        about_data["updated_at"] = datetime.utcnow()
        result = about_collection.update_one(
            {"_id": ObjectId(about_id)},
            {"$set": about_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="About section not found")
        print(f"✓ About updated successfully")
        return {"message": "About section updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating about: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
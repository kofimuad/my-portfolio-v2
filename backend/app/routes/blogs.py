from fastapi import APIRouter, HTTPException, Depends, Header
from bson.objectid import ObjectId
from datetime import datetime
from app.database import blogs_collection
from app.models import Blog, BlogCreate
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

# GET all blogs (public)
@router.get("/")
def get_blogs():
    try:
        blogs = list(blogs_collection.find().sort("created_at", -1))
        for blog in blogs:
            blog["id"] = str(blog["_id"])
            del blog["_id"]
        return blogs
    except Exception as e:
        print(f"❌ Error fetching blogs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# GET single blog (public)
@router.get("/{blog_id}")
def get_blog(blog_id: str):
    try:
        blog = blogs_collection.find_one({"_id": ObjectId(blog_id)})
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        blog["id"] = str(blog["_id"])
        del blog["_id"]
        return blog
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching blog: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# CREATE blog (requires auth)
@router.post("/")
def create_blog(blog: BlogCreate, token: str = Depends(get_token)):
    try:
        print(f"✓ Creating blog with token: {token[:20]}...")
        verify_token(token)
        blog_data = blog.dict()
        blog_data["created_at"] = datetime.utcnow()
        blog_data["updated_at"] = datetime.utcnow()
        result = blogs_collection.insert_one(blog_data)
        blog_data["id"] = str(result.inserted_id)
        del blog_data["_id"]
        print(f"✓ Blog created successfully")
        return blog_data
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating blog: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE blog (requires auth)
@router.put("/{blog_id}")
def update_blog(blog_id: str, blog: BlogCreate, token: str = Depends(get_token)):
    try:
        print(f"✓ Updating blog {blog_id} with token: {token[:20]}...")
        verify_token(token)
        blog_data = blog.dict()
        blog_data["updated_at"] = datetime.utcnow()
        result = blogs_collection.update_one(
            {"_id": ObjectId(blog_id)},
            {"$set": blog_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        print(f"✓ Blog updated successfully")
        return {"message": "Blog updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating blog: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# DELETE blog (requires auth)
@router.delete("/{blog_id}")
def delete_blog(blog_id: str, token: str = Depends(get_token)):
    try:
        print(f"✓ Deleting blog {blog_id} with token: {token[:20]}...")
        verify_token(token)
        result = blogs_collection.delete_one({"_id": ObjectId(blog_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        print(f"✓ Blog deleted successfully")
        return {"message": "Blog deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting blog: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
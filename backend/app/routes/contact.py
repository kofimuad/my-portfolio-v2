from fastapi import APIRouter, HTTPException, Depends, Header
from bson.objectid import ObjectId
from datetime import datetime
from app.database import contacts_collection
from app.models import Contact, ContactBase
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

# GET all contact submissions (requires auth)
@router.get("/")
def get_contacts(token: str = Depends(get_token)):
    try:
        print(f"✓ Fetching contacts with token: {token[:20]}...")
        verify_token(token)
        contacts = list(contacts_collection.find().sort("created_at", -1))
        for contact in contacts:
            contact["id"] = str(contact["_id"])
            del contact["_id"]
        return contacts
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching contacts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# CREATE contact submission (public - for form submissions)
@router.post("/")
def create_contact(contact: ContactBase):
    try:
        print(f"✓ Creating contact submission")
        contact_data = contact.dict()
        contact_data["created_at"] = datetime.utcnow()
        result = contacts_collection.insert_one(contact_data)
        contact_data["id"] = str(result.inserted_id)
        del contact_data["_id"]
        return contact_data
    except Exception as e:
        print(f"❌ Error creating contact: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# DELETE contact submission (requires auth)
@router.delete("/{contact_id}")
def delete_contact(contact_id: str, token: str = Depends(get_token)):
    try:
        print(f"✓ Deleting contact {contact_id} with token: {token[:20]}...")
        verify_token(token)
        result = contacts_collection.delete_one({"_id": ObjectId(contact_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contact not found")
        print(f"✓ Contact deleted successfully")
        return {"message": "Contact deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting contact: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
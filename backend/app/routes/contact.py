from fastapi import APIRouter, HTTPException, Depends
from bson.objectid import ObjectId
from datetime import datetime
from app.database import contacts_collection
from app.models import Contact, ContactBase
from app.auth import verify_token
from typing import Optional

router = APIRouter()

def get_token_optional(token: Optional[str] = None) -> Optional[str]:
    return token

# GET all contact submissions (requires auth)
@router.get("/")
def get_contacts(token: str = Depends(get_token_optional)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        verify_token(token)
        contacts = list(contacts_collection.find().sort("created_at", -1))
        for contact in contacts:
            contact["id"] = str(contact["_id"])
            del contact["_id"]
        return contacts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# CREATE contact submission (public - for form submissions)
@router.post("/")
def create_contact(contact: ContactBase):
    try:
        contact_data = contact.dict()
        contact_data["created_at"] = datetime.utcnow()
        result = contacts_collection.insert_one(contact_data)
        contact_data["id"] = str(result.inserted_id)
        del contact_data["_id"]
        return contact_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE contact submission (requires auth)
@router.delete("/{contact_id}")
def delete_contact(contact_id: str, token: str = Depends(get_token_optional)):
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        verify_token(token)
        result = contacts_collection.delete_one({"_id": ObjectId(contact_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Contact not found")
        return {"message": "Contact deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# app/routes/auth.py
from fastapi import APIRouter, HTTPException, status
from app.models import LoginRequest, LoginResponse
from app.auth import create_access_token
from app.config import ADMIN_PASSWORD

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    """
    Admin login endpoint.
    Returns JWT token if credentials are correct.
    """
    print(f"Login attempt with password: {'*' * len(credentials.password)}")
    print(f"Expected password: {'*' * len(ADMIN_PASSWORD)}")
    
    # Check if password matches
    if not credentials.password or credentials.password != ADMIN_PASSWORD:
        print("❌ Login failed: Invalid password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    try:
        print("✓ Password correct, generating token...")
        token = create_access_token({"admin": True})
        print(f"✓ Token generated successfully")
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        print(f"❌ Token generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate token"
        )
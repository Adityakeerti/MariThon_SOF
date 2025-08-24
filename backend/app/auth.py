from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from datetime import timedelta
import re

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return username

@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate):
    """Create a new user account"""
    # Validate input
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    # Basic email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Create user
    user_id, message = AuthService.create_user(
        email=user_data.email,
        password=user_data.password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username
    )
    
    if user_id is None:
        raise HTTPException(status_code=400, detail=message)
    
    return {"message": message, "user_id": user_id}

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return JWT token"""
    user, message = AuthService.authenticate_user(
        email=user_credentials.email,
        password=user_credentials.password
    )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = AuthService.create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    # Create user response object
    user_response = UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        updated_at=user["updated_at"]
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_email: str = Depends(get_current_user)):
    """Get current user information"""
    # Get user from database
    user = AuthService.get_user_by_email(current_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        updated_at=user["updated_at"]
    )

@router.post("/logout")
async def logout(current_username: str = Depends(get_current_user)):
    """Logout user (invalidate token)"""
    # In a real application, you would add the token to a blacklist
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}



from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.schemas.role import RoleResponse

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_ids: Optional[List[UUID]] = []

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    status: Optional[str] = None
    role_ids: Optional[List[UUID]] = None

class UserResponse(UserBase):
    id: UUID
    organization_id: UUID
    status: str
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    roles: List[RoleResponse] = []

    class Config:
        from_attributes = True

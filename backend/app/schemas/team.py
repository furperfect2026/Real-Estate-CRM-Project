from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.schemas.user import UserResponse

class TeamBase(BaseModel):
    name: str
    type: str

class TeamCreate(TeamBase):
    manager_id: Optional[UUID] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    manager_id: Optional[UUID] = None

class TeamResponse(TeamBase):
    id: UUID
    organization_id: UUID
    manager_id: Optional[UUID]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class TeamMemberAdd(BaseModel):
    user_id: UUID
    role_in_team: Optional[str] = None

class TeamMemberResponse(BaseModel):
    user_id: UUID
    team_id: UUID
    role_in_team: Optional[str]
    joined_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

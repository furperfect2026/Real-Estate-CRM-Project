from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.lead import LeadSource, LeadStatus

class LeadBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    phone_normalized: Optional[str] = None
    source: Optional[LeadSource] = LeadSource.OTHER
    budget: Optional[float] = None
    property_type: Optional[str] = None
    status: Optional[LeadStatus] = LeadStatus.ACTIVE

class LeadCreate(LeadBase):
    user_id: Optional[UUID] = None
    pipeline_stage_id: Optional[UUID] = None

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    phone_normalized: Optional[str] = None
    source: Optional[LeadSource] = None
    budget: Optional[float] = None
    property_type: Optional[str] = None
    status: Optional[LeadStatus] = None
    user_id: Optional[UUID] = None
    pipeline_stage_id: Optional[UUID] = None

class LeadAssign(BaseModel):
    user_id: UUID

class LeadResponse(LeadBase):
    id: UUID
    organization_id: UUID
    user_id: Optional[UUID] = None
    pipeline_stage_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class LeadHistoryBase(BaseModel):
    action: str
    notes: Optional[str] = None

class LeadHistoryCreate(LeadHistoryBase):
    pass

class LeadHistoryResponse(LeadHistoryBase):
    id: UUID
    lead_id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

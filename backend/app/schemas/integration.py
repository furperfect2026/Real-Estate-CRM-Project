from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.integration import IntegrationPlatform

class IntegrationBase(BaseModel):
    platform_name: IntegrationPlatform
    webhook_url: Optional[str] = None
    api_key: Optional[str] = None
    secret: Optional[str] = None
    is_active: bool = True

class IntegrationCreate(IntegrationBase):
    pass

class IntegrationUpdate(BaseModel):
    platform_name: Optional[IntegrationPlatform] = None
    webhook_url: Optional[str] = None
    api_key: Optional[str] = None
    secret: Optional[str] = None
    is_active: Optional[bool] = None

class IntegrationResponse(IntegrationBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

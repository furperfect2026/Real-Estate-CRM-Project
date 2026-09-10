from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PipelineStageBase(BaseModel):
    name: str
    order_index: Optional[int] = 0
    color: Optional[str] = None

class PipelineStageCreate(PipelineStageBase):
    pass

class PipelineStageUpdate(BaseModel):
    name: Optional[str] = None
    order_index: Optional[int] = None
    color: Optional[str] = None

class PipelineStageResponse(PipelineStageBase):
    id: UUID
    pipeline_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class PipelineBase(BaseModel):
    name: str
    is_default: Optional[bool] = False

class PipelineCreate(PipelineBase):
    pass

class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    is_default: Optional[bool] = None

class PipelineResponse(PipelineBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    stages: Optional[List[PipelineStageResponse]] = []

    class Config:
        from_attributes = True

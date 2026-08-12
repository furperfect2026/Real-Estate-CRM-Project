from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from uuid import UUID

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = 'CUSTOM'
    priority: Optional[str] = 'MEDIUM'
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    reminder_at: Optional[datetime] = None
    is_recurring: Optional[bool] = False
    recurrence_rule: Optional[str] = None
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    assigned_to: UUID
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    project_id: Optional[UUID] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    due_time: Optional[time] = None
    reminder_at: Optional[datetime] = None
    status: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[UUID] = None

class TaskResponse(TaskBase):
    id: UUID
    organization_id: UUID
    lead_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    assigned_to: UUID
    assigned_by: UUID
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

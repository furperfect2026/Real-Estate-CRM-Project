import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, Text, Boolean, Date, Time
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
from app.models.base_model import BaseModel

class Task(Base, BaseModel):
    __tablename__ = "tasks"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(Enum('CALL', 'FOLLOW_UP', 'WHATSAPP', 'EMAIL', 'SITE_VISIT', 'MEETING', 'PAYMENT', 'DOCUMENT', 'BOOKING', 'APPROVAL', 'CUSTOM', name='task_type'), default='CUSTOM')
    lead_id = Column(UUID(as_uuid=True), nullable=True)
    customer_id = Column(UUID(as_uuid=True), nullable=True)
    project_id = Column(UUID(as_uuid=True), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    priority = Column(Enum('LOW', 'MEDIUM', 'HIGH', 'URGENT', name='task_priority'), default='MEDIUM')
    due_date = Column(Date, nullable=True)
    due_time = Column(Time, nullable=True)
    reminder_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum('TODO', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', name='task_status'), default='TODO')
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String(255), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

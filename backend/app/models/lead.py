from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base_model import BaseModel
from sqlalchemy.orm import relationship
import enum

class LeadSource(enum.Enum):
    WEBSITE = "WEBSITE"
    REFERRAL = "REFERRAL"
    SOCIAL = "SOCIAL"
    WHATSAPP = "WHATSAPP"
    PORTAL = "PORTAL"
    OTHER = "OTHER"

class LeadStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    WON = "WON"
    LOST = "LOST"

class Lead(BaseModel):
    __tablename__ = 'leads'

    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True) # assignee
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    phone_normalized = Column(String, nullable=True)
    source = Column(SQLEnum(LeadSource), nullable=False, default=LeadSource.OTHER)
    budget = Column(Float, nullable=True)
    property_type = Column(String, nullable=True)
    pipeline_stage_id = Column(UUID(as_uuid=True), ForeignKey('pipeline_stages.id'), nullable=True)
    status = Column(SQLEnum(LeadStatus), nullable=False, default=LeadStatus.ACTIVE)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    history = relationship("LeadHistory", back_populates="lead", cascade="all, delete-orphan")

class LeadHistory(BaseModel):
    __tablename__ = 'lead_history'

    lead_id = Column(UUID(as_uuid=True), ForeignKey('leads.id'), nullable=False)
    action = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    lead = relationship("Lead", back_populates="history")

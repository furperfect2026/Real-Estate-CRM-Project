import uuid
from sqlalchemy import Column, String, Enum, DateTime, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base import Base
from app.models.base_model import BaseModel

class Organization(Base, BaseModel):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    domain = Column(String(255), nullable=True)
    status = Column(Enum('ACTIVE', 'SUSPENDED', 'TRIAL', name='organization_status'), default='TRIAL')
    settings = Column(JSONB, server_default=text("'{}'::jsonb"))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

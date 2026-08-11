import uuid
from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
from app.models.base_model import BaseModel

class Team(Base, BaseModel):
    __tablename__ = "teams"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(Enum('CALLER', 'SALES', 'MANAGEMENT', 'SUPPORT', 'CUSTOM', name='team_type'), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

class TeamMember(Base):
    __tablename__ = "team_members"
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_in_team = Column(String(50), nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base_model import BaseModel

class IntegrationPlatform(enum.Enum):
    FACEBOOK = "FACEBOOK"
    NINETY_NINE_ACRES = "99ACRES"
    MAGICBRICKS = "MAGICBRICKS"
    HOUSING = "HOUSING"
    WEBSITE = "WEBSITE"
    CUSTOM = "CUSTOM"

class Integration(BaseModel):
    __tablename__ = 'integrations'

    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    platform_name = Column(SQLEnum(IntegrationPlatform), nullable=False)
    webhook_url = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    secret = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

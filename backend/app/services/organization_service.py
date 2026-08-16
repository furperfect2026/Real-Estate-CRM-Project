from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.organization import Organization
from app.schemas.organization import OrganizationUpdate
from app.core.exceptions import NotFoundException

class OrganizationService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    async def get_current(self) -> Organization:
        result = await self.db.execute(select(Organization).filter(Organization.id == self.org_id))
        org = result.scalars().first()
        if not org:
            raise NotFoundException("Organization not found")
        return org

    async def update_settings(self, settings: dict) -> Organization:
        org = await self.get_current()
        # Merge settings
        current_settings = org.settings or {}
        current_settings.update(settings)
        org.settings = current_settings
        await self.db.commit()
        await self.db.refresh(org)
        return org

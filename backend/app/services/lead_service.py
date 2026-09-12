from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import datetime, timezone
from app.models.lead import Lead, LeadHistory
from app.schemas.lead import LeadCreate, LeadUpdate, LeadHistoryCreate
from app.core.exceptions import NotFoundException

class LeadService:
    def __init__(self, db: AsyncSession, org_id: UUID, user_id: UUID):
        self.db = db
        self.org_id = org_id
        self.user_id = user_id

    async def create_lead(self, req: LeadCreate) -> Lead:
        lead = Lead(
            organization_id=self.org_id,
            **req.model_dump()
        )
        self.db.add(lead)
        await self.db.commit()
        await self.db.refresh(lead)
        
        # Create history entry
        await self.add_history(lead.id, LeadHistoryCreate(action="CREATED", notes="Lead created manually"))
        
        return lead

    async def get_lead(self, lead_id: UUID) -> Lead:
        result = await self.db.execute(
            select(Lead)
            .filter(Lead.id == lead_id, Lead.organization_id == self.org_id, Lead.deleted_at.is_(None))
        )
        lead = result.scalars().first()
        if not lead:
            raise NotFoundException("Lead not found")
        return lead

    async def update_lead(self, lead_id: UUID, req: LeadUpdate) -> Lead:
        lead = await self.get_lead(lead_id)
        update_data = req.model_dump(exclude_unset=True)
        
        changes = []
        for key, value in update_data.items():
            old_val = getattr(lead, key)
            if old_val != value:
                changes.append(f"{key}: {old_val} -> {value}")
            setattr(lead, key, value)
            
        await self.db.commit()
        await self.db.refresh(lead)
        
        if changes:
            notes = "Updated fields: " + ", ".join(changes)
            await self.add_history(lead.id, LeadHistoryCreate(action="UPDATED", notes=notes))
            
        return lead

    async def delete_lead(self, lead_id: UUID) -> None:
        lead = await self.get_lead(lead_id)
        lead.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()
        
        await self.add_history(lead.id, LeadHistoryCreate(action="DELETED", notes="Lead deleted"))

    def get_leads_query(self, filters: dict = {}):
        query = select(Lead).filter(Lead.organization_id == self.org_id, Lead.deleted_at.is_(None))
        if filters.get("user_id"):
            query = query.filter(Lead.user_id == filters["user_id"])
        if filters.get("status"):
            query = query.filter(Lead.status == filters["status"])
        if filters.get("pipeline_stage_id"):
            query = query.filter(Lead.pipeline_stage_id == filters["pipeline_stage_id"])
        return query
        
    async def get_lead_history(self, lead_id: UUID):
        # Ensure lead exists in org
        await self.get_lead(lead_id)
        result = await self.db.execute(
            select(LeadHistory)
            .filter(LeadHistory.lead_id == lead_id)
            .order_by(LeadHistory.created_at.desc())
        )
        return result.scalars().all()
        
    async def add_history(self, lead_id: UUID, req: LeadHistoryCreate) -> LeadHistory:
        history = LeadHistory(
            lead_id=lead_id,
            created_by=self.user_id,
            **req.model_dump()
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history

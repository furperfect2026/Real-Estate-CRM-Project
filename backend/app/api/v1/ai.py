from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission
from app.services.lead_service import LeadService
from app.services.ai_service import AIService
from uuid import UUID

router = APIRouter()
ai_service = AIService()

@router.get("/leads/{id}/score")
async def get_lead_score(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    
    lead = await lead_service.get_lead(id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        
    return ai_service.generate_lead_score(lead)

@router.get("/leads/{id}/generate-message")
async def generate_lead_message(
    id: UUID,
    tone: str = "friendly",
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    
    lead = await lead_service.get_lead(id)
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        
    message = ai_service.generate_follow_up(lead, tone)
    return {"message": message}

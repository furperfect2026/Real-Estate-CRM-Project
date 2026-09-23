from fastapi import APIRouter, Depends, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.db.session import get_db
from app.models.integration import Integration, IntegrationPlatform
from app.models.lead import Lead, LeadSource, LeadStatus
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def map_platform_to_source(platform: IntegrationPlatform) -> LeadSource:
    if platform == IntegrationPlatform.FACEBOOK:
        return LeadSource.SOCIAL
    elif platform in [IntegrationPlatform.NINETY_NINE_ACRES, IntegrationPlatform.MAGICBRICKS, IntegrationPlatform.HOUSING]:
        return LeadSource.PORTAL
    elif platform == IntegrationPlatform.WEBSITE:
        return LeadSource.WEBSITE
    return LeadSource.OTHER

@router.post("/{platform_name}/{org_id}", status_code=status.HTTP_201_CREATED)
async def receive_webhook(
    platform_name: str,
    org_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    try:
        platform_enum = IntegrationPlatform(platform_name.upper())
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid platform name")

    # Validate integration
    result = await db.execute(
        select(Integration).filter(
            Integration.organization_id == org_id,
            Integration.platform_name == platform_enum,
            Integration.is_active == True
        )
    )
    integration = result.scalars().first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found or inactive")

    # Read payload
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    # Simple MVP mapping
    first_name = payload.get("first_name") or payload.get("full_name") or "Unknown"
    last_name = payload.get("last_name") or ""
    
    # If full_name is provided, we might want to split it
    if "full_name" in payload and not payload.get("first_name"):
        parts = payload["full_name"].split(" ", 1)
        first_name = parts[0]
        if len(parts) > 1:
            last_name = parts[1]

    phone = payload.get("phone") or payload.get("phone_number")
    email = payload.get("email")

    from sqlalchemy import func
    from app.models.user import User

    # Find active users in org
    users_result = await db.execute(
        select(User.id).filter(User.organization_id == org_id, User.status == 'ACTIVE')
    )
    active_users = users_result.scalars().all()

    assigned_user_id = None
    if active_users:
        # Simple DB tracking: assign to the user with the least leads
        leads_count_result = await db.execute(
            select(Lead.user_id, func.count(Lead.id))
            .filter(Lead.organization_id == org_id, Lead.user_id.in_(active_users))
            .group_by(Lead.user_id)
        )
        lead_counts = dict(leads_count_result.all())
        active_users_sorted = sorted(active_users, key=lambda u: lead_counts.get(u, 0))
        assigned_user_id = active_users_sorted[0]

    lead = Lead(
        organization_id=org_id,
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        email=email,
        source=map_platform_to_source(platform_enum),
        status=LeadStatus.ACTIVE,
        user_id=assigned_user_id
    )
    
    db.add(lead)
    await db.commit()
    await db.refresh(lead)

    return {"status": "success", "lead_id": str(lead.id)}

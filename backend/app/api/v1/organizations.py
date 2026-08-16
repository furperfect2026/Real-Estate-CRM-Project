from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.organization import OrganizationResponse, OrganizationUpdate
from app.services.organization_service import OrganizationService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission

router = APIRouter()

@router.get("/current", response_model=OrganizationResponse)
async def get_current_org(
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    return org

@router.put("/current/settings", response_model=OrganizationResponse, dependencies=[Depends(require_permission('settings', 'update'))])
async def update_settings(
    settings: dict,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    org_service = OrganizationService(db, org.id)
    return await org_service.update_settings(settings)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.dashboard_service import DashboardService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission

router = APIRouter()

@router.get("/stats", dependencies=[Depends(require_permission('dashboard', 'view'))])
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    dashboard_service = DashboardService(db, org.id)
    return await dashboard_service.get_stats()

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.lead import LeadResponse, LeadCreate, LeadUpdate, LeadHistoryResponse, LeadHistoryCreate, LeadAssign
from app.schemas.common import PaginatedResponse, PaginatedParams
from app.services.lead_service import LeadService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission
from app.core.pagination import paginate
from uuid import UUID
from typing import List

router = APIRouter()

@router.get("", response_model=PaginatedResponse[LeadResponse], dependencies=[Depends(require_permission('leads', 'view'))])
async def list_leads(
    params: PaginatedParams = Depends(),
    user_id: UUID = None,
    status: str = None,
    pipeline_stage_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    filters = {}
    if user_id: filters['user_id'] = user_id
    if status: filters['status'] = status
    if pipeline_stage_id: filters['pipeline_stage_id'] = pipeline_stage_id
    
    query = lead_service.get_leads_query(filters)
    return await paginate(db, query, params)

@router.post("", response_model=LeadResponse, dependencies=[Depends(require_permission('leads', 'create'))])
async def create_lead(
    req: LeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    return await lead_service.create_lead(req)

@router.get("/{id}", response_model=LeadResponse, dependencies=[Depends(require_permission('leads', 'view'))])
async def get_lead(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    return await lead_service.get_lead(id)

@router.put("/{id}", response_model=LeadResponse, dependencies=[Depends(require_permission('leads', 'update'))])
async def update_lead(
    id: UUID,
    req: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    return await lead_service.update_lead(id, req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('leads', 'delete'))])
async def delete_lead(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    await lead_service.delete_lead(id)

@router.put("/{id}/assign", response_model=LeadResponse, dependencies=[Depends(require_permission('leads', 'update'))])
async def assign_lead(
    id: UUID,
    req: LeadAssign,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    # Using LeadUpdate internally to update the user_id
    update_req = LeadUpdate(user_id=req.user_id)
    return await lead_service.update_lead(id, update_req)

@router.get("/{id}/history", response_model=List[LeadHistoryResponse], dependencies=[Depends(require_permission('leads', 'view'))])
async def get_lead_history(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    return await lead_service.get_lead_history(id)

@router.post("/{id}/history", response_model=LeadHistoryResponse, dependencies=[Depends(require_permission('leads', 'update'))])
async def add_lead_history(
    id: UUID,
    req: LeadHistoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    lead_service = LeadService(db, org.id, user.id)
    # verify lead exists
    await lead_service.get_lead(id)
    return await lead_service.add_history(id, req)

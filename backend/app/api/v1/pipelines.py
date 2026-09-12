from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.pipeline import PipelineResponse, PipelineCreate, PipelineUpdate, PipelineStageResponse, PipelineStageCreate, PipelineStageUpdate
from app.schemas.common import PaginatedResponse, PaginatedParams
from app.services.pipeline_service import PipelineService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission
from app.core.pagination import paginate
from uuid import UUID

router = APIRouter()

@router.get("", response_model=PaginatedResponse[PipelineResponse], dependencies=[Depends(require_permission('pipelines', 'view'))])
async def list_pipelines(
    params: PaginatedParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    query = pipeline_service.get_pipelines_query()
    return await paginate(db, query, params)

@router.post("", response_model=PipelineResponse, dependencies=[Depends(require_permission('pipelines', 'create'))])
async def create_pipeline(
    req: PipelineCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    return await pipeline_service.create_pipeline(req)

@router.get("/{id}", response_model=PipelineResponse, dependencies=[Depends(require_permission('pipelines', 'view'))])
async def get_pipeline(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    return await pipeline_service.get_pipeline(id)

@router.put("/{id}", response_model=PipelineResponse, dependencies=[Depends(require_permission('pipelines', 'update'))])
async def update_pipeline(
    id: UUID,
    req: PipelineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    return await pipeline_service.update_pipeline(id, req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('pipelines', 'delete'))])
async def delete_pipeline(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    await pipeline_service.delete_pipeline(id)

@router.post("/{pipeline_id}/stages", response_model=PipelineStageResponse, dependencies=[Depends(require_permission('pipelines', 'create'))])
async def create_stage(
    pipeline_id: UUID,
    req: PipelineStageCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    return await pipeline_service.create_stage(pipeline_id, req)

@router.put("/{pipeline_id}/stages/{stage_id}", response_model=PipelineStageResponse, dependencies=[Depends(require_permission('pipelines', 'update'))])
async def update_stage(
    pipeline_id: UUID,
    stage_id: UUID,
    req: PipelineStageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    return await pipeline_service.update_stage(pipeline_id, stage_id, req)

@router.delete("/{pipeline_id}/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('pipelines', 'delete'))])
async def delete_stage(
    pipeline_id: UUID,
    stage_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    pipeline_service = PipelineService(db, org.id, user.id)
    await pipeline_service.delete_stage(pipeline_id, stage_id)

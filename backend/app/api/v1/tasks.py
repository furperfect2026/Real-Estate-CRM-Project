from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.task import TaskResponse, TaskCreate, TaskUpdate
from app.schemas.common import PaginatedResponse, PaginatedParams
from app.services.task_service import TaskService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission
from app.core.pagination import paginate
from uuid import UUID

router = APIRouter()

@router.get("", response_model=PaginatedResponse[TaskResponse], dependencies=[Depends(require_permission('tasks', 'view'))])
async def list_tasks(
    params: PaginatedParams = Depends(),
    task_status: str = None,
    assigned_to: UUID = None,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    filters = {}
    if task_status: filters['status'] = task_status
    if assigned_to: filters['assigned_to'] = assigned_to
    query = task_service.get_tasks_query(filters)
    return await paginate(db, query, params)

@router.post("", response_model=TaskResponse, dependencies=[Depends(require_permission('tasks', 'create'))])
async def create_task(
    req: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    return await task_service.create_task(req)

@router.get("/my-tasks", response_model=PaginatedResponse[TaskResponse])
async def get_my_tasks(
    params: PaginatedParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    query = task_service.get_my_tasks()
    return await paginate(db, query, params)

@router.get("/today", response_model=PaginatedResponse[TaskResponse])
async def get_today_tasks(
    params: PaginatedParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    query = task_service.get_today_tasks()
    return await paginate(db, query, params)

@router.get("/overdue", response_model=PaginatedResponse[TaskResponse])
async def get_overdue_tasks(
    params: PaginatedParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    query = task_service.get_overdue_tasks()
    return await paginate(db, query, params)

@router.get("/{id}", response_model=TaskResponse, dependencies=[Depends(require_permission('tasks', 'view'))])
async def get_task(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    return await task_service.get_task(id)

@router.put("/{id}", response_model=TaskResponse, dependencies=[Depends(require_permission('tasks', 'update'))])
async def update_task(
    id: UUID,
    req: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    return await task_service.update_task(id, req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('tasks', 'delete'))])
async def delete_task(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    user, org = current_user_and_org
    task_service = TaskService(db, org.id, user.id)
    await task_service.delete_task(id)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.schemas.common import PaginatedResponse, PaginatedParams
from app.services.user_service import UserService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission
from app.core.pagination import paginate
from uuid import UUID

router = APIRouter()

@router.get("", response_model=PaginatedResponse[UserResponse], dependencies=[Depends(require_permission('users', 'view'))])
async def list_users(
    params: PaginatedParams = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    user_service = UserService(db, org.id)
    query = user_service.get_users_query()
    return await paginate(db, query, params)

@router.post("", response_model=UserResponse, dependencies=[Depends(require_permission('users', 'create'))])
async def create_user(
    req: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    user_service = UserService(db, org.id)
    return await user_service.create_user(req)

@router.get("/{id}", response_model=UserResponse, dependencies=[Depends(require_permission('users', 'view'))])
async def get_user(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    user_service = UserService(db, org.id)
    return await user_service.get_user(id)

@router.delete("/{id}", dependencies=[Depends(require_permission('users', 'delete'))])
async def delete_user(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    user_service = UserService(db, org.id)
    user = await user_service.get_user(id)
    # Perform soft delete logic
    from datetime import datetime, timezone
    user.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return {"message": "User deleted successfully"}

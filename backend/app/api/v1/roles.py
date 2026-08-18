from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.schemas.role import RoleResponse, RoleCreate, RoleUpdate, PermissionResponse, RolePermissionUpdate
from app.services.rbac_service import RBACService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission

router = APIRouter()

@router.get("", response_model=List[RoleResponse], dependencies=[Depends(require_permission('roles', 'view'))])
async def list_roles(db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = RBACService(db, org.id)
    return await service.list_roles()

@router.post("", response_model=RoleResponse, dependencies=[Depends(require_permission('roles', 'create'))])
async def create_role(req: RoleCreate, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = RBACService(db, org.id)
    return await service.create_role(req.name, req.slug, req.description)

@router.put("/{id}", response_model=RoleResponse, dependencies=[Depends(require_permission('roles', 'update'))])
async def update_role(id: UUID, req: RoleUpdate, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = RBACService(db, org.id)
    return await service.update_role(id, req)

@router.get("/{id}/permissions", response_model=List[PermissionResponse], dependencies=[Depends(require_permission('roles', 'view'))])
async def get_role_permissions(id: UUID, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = RBACService(db, org.id)
    return await service.get_role_permissions(id)

@router.put("/{id}/permissions", response_model=List[PermissionResponse], dependencies=[Depends(require_permission('roles', 'update'))])
async def set_role_permissions(id: UUID, req: RolePermissionUpdate, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = RBACService(db, org.id)
    return await service.set_role_permissions(id, req.permission_ids)

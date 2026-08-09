from functools import wraps
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.role import Role, Permission, RolePermission, UserRole
from app.core.exceptions import ForbiddenException, UnauthorizedException

def require_permission(resource: str, action: str):
    async def permission_checker(
        request: Request,
        db: AsyncSession = Depends(get_db)
    ):
        user_id = request.state.user_id
        org_id = request.state.org_id
        
        if not user_id or not org_id:
            raise UnauthorizedException()

        # Check permissions in database
        query = (
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(
                UserRole.user_id == user_id,
                Role.organization_id == org_id, # Can also include system roles if they have organization_id=None
                Permission.resource == resource,
                Permission.action == action
            )
        )
        
        # Check system roles as well
        system_role_query = (
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(
                UserRole.user_id == user_id,
                Role.organization_id.is_(None),
                Permission.resource == resource,
                Permission.action == action
            )
        )
        
        result = await db.execute(query)
        sys_result = await db.execute(system_role_query)
        
        has_permission = result.scalars().first() is not None or sys_result.scalars().first() is not None
        
        if not has_permission:
            raise ForbiddenException(f"Missing required permission: {resource}.{action}")
            
        return True

    return permission_checker

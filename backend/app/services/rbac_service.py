from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from uuid import UUID
from app.models.role import Role, Permission, RolePermission
from app.schemas.role import RoleCreate, RoleUpdate
from app.core.exceptions import NotFoundException, BadRequestException

class RBACService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    async def list_roles(self):
        result = await self.db.execute(select(Role).filter(or_(Role.organization_id == self.org_id, Role.organization_id.is_(None))))
        return result.scalars().all()

    async def create_role(self, name: str, slug: str, description: str = None) -> Role:
        role = Role(organization_id=self.org_id, name=name, slug=slug, description=description, is_system=False)
        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def update_role(self, role_id: UUID, data: RoleUpdate) -> Role:
        result = await self.db.execute(select(Role).filter(Role.id == role_id, Role.organization_id == self.org_id))
        role = result.scalars().first()
        if not role:
            raise NotFoundException("Role not found")
        if role.is_system:
            raise BadRequestException("Cannot edit system roles")
            
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(role, key, value)
            
        await self.db.commit()
        await self.db.refresh(role)
        return role

    async def get_role_permissions(self, role_id: UUID):
        result = await self.db.execute(
            select(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role_id)
        )
        return result.scalars().all()

    async def set_role_permissions(self, role_id: UUID, permission_ids: list[UUID]):
        result = await self.db.execute(select(Role).filter(Role.id == role_id, Role.organization_id == self.org_id))
        role = result.scalars().first()
        if not role:
            raise NotFoundException("Role not found")
        if role.is_system:
            raise BadRequestException("Cannot edit permissions of system roles")
            
        # Delete existing
        await self.db.execute(RolePermission.__table__.delete().where(RolePermission.role_id == role_id))
        
        # Add new
        for pid in permission_ids:
            self.db.add(RolePermission(role_id=role_id, permission_id=pid))
            
        await self.db.commit()
        return await self.get_role_permissions(role_id)

    async def list_permissions(self):
        result = await self.db.execute(select(Permission))
        return result.scalars().all()

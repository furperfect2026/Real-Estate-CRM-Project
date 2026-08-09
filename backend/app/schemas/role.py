from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class PermissionResponse(BaseModel):
    id: UUID
    resource: str
    action: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    slug: str

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(RoleBase):
    id: UUID
    organization_id: Optional[UUID] = None
    slug: str
    is_system: bool

    class Config:
        from_attributes = True

class RolePermissionUpdate(BaseModel):
    permission_ids: List[UUID]

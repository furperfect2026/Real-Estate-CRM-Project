from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Tuple
from uuid import UUID
from app.db.session import get_db
from app.models.user import User
from app.models.organization import Organization
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from sqlalchemy import select

async def get_current_user_and_org(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Tuple[User, Organization]:
    user_id = request.state.user_id
    org_id = request.state.org_id

    if not user_id or not org_id:
        raise UnauthorizedException("Could not validate credentials")

    try:
        user_uuid = UUID(user_id)
        org_uuid = UUID(org_id)
    except ValueError:
        raise UnauthorizedException("Invalid credentials")

    # Fetch user
    result = await db.execute(select(User).filter(User.id == user_uuid, User.organization_id == org_uuid))
    user = result.scalars().first()
    
    if not user:
        raise UnauthorizedException("User not found")
        
    if user.status != 'ACTIVE':
        raise UnauthorizedException("Inactive user")

    # Fetch organization
    org_result = await db.execute(select(Organization).filter(Organization.id == org_uuid))
    org = org_result.scalars().first()

    if not org:
        raise UnauthorizedException("Organization not found")
        
    if org.status == 'SUSPENDED':
        raise UnauthorizedException("Organization is suspended")

    return user, org

async def get_current_user(user_and_org: Tuple[User, Organization] = Depends(get_current_user_and_org)) -> User:
    return user_and_org[0]

async def get_current_org(user_and_org: Tuple[User, Organization] = Depends(get_current_user_and_org)) -> Organization:
    return user_and_org[1]

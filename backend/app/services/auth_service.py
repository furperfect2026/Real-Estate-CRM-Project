from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.organization import Organization
from app.models.role import Role, UserRole
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException
from app.utils.phone import normalize_phone
import re
import uuid

class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def register(self, req: RegisterRequest) -> dict:
        slug = re.sub(r'[^a-z0-9]+', '-', req.org_name.lower()).strip('-')
        
        # Check if slug exists
        existing_org = await self.db.execute(select(Organization).filter(Organization.slug == slug))
        if existing_org.scalars().first():
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
            
        org = Organization(name=req.org_name, slug=slug)
        self.db.add(org)
        await self.db.flush()
        
        user = User(
            organization_id=org.id,
            email=req.email,
            password_hash=get_password_hash(req.password),
            first_name=req.first_name,
            last_name=req.last_name,
            phone=req.phone,
            phone_normalized=normalize_phone(req.phone)
        )
        self.db.add(user)
        await self.db.flush()
        
        # Assign COMPANY_ADMIN role
        role_res = await self.db.execute(select(Role).filter(Role.name == 'COMPANY_ADMIN', Role.organization_id.is_(None)))
        admin_role = role_res.scalars().first()
        if admin_role:
            user_role = UserRole(user_id=user.id, role_id=admin_role.id)
            self.db.add(user_role)
            
        await self.db.commit()
        await self.db.refresh(user)
        
        access_token = create_access_token(subject=user.id, org_id=org.id)
        refresh_token = create_refresh_token(subject=user.id, org_id=org.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
            "organization": org
        }

    async def login(self, req: LoginRequest) -> dict:
        result = await self.db.execute(select(User).filter(User.email == req.email))
        user = result.scalars().first()
        
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedException("Incorrect email or password")
            
        org_result = await self.db.execute(select(Organization).filter(Organization.id == user.organization_id))
        org = org_result.scalars().first()
        
        access_token = create_access_token(subject=user.id, org_id=user.organization_id)
        refresh_token = create_refresh_token(subject=user.id, org_id=user.organization_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
            "organization": org
        }

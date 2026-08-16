from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.user import User
from app.models.role import UserRole, Role
from app.schemas.user import UserCreate, UserUpdate
from app.core.exceptions import NotFoundException, ConflictException
from app.core.security import get_password_hash
from app.utils.phone import normalize_phone

class UserService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    async def create_user(self, req: UserCreate) -> User:
        result = await self.db.execute(select(User).filter(User.email == req.email, User.organization_id == self.org_id))
        if result.scalars().first():
            raise ConflictException("User with this email already exists")

        user = User(
            organization_id=self.org_id,
            email=req.email,
            password_hash=get_password_hash(req.password),
            first_name=req.first_name,
            last_name=req.last_name,
            phone=req.phone,
            phone_normalized=normalize_phone(req.phone)
        )
        self.db.add(user)
        await self.db.flush()

        if req.role_ids:
            for role_id in req.role_ids:
                user_role = UserRole(user_id=user.id, role_id=role_id)
                self.db.add(user_role)
                
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get_user(self, user_id: UUID) -> User:
        result = await self.db.execute(select(User).filter(User.id == user_id, User.organization_id == self.org_id))
        user = result.scalars().first()
        if not user:
            raise NotFoundException("User not found")
        return user

    def get_users_query(self):
        return select(User).filter(User.organization_id == self.org_id)

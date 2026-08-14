from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, Token
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.dependencies import get_current_user_and_org

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.register(req)

@router.post("/login", response_model=dict)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    return await auth_service.login(req)

@router.post("/refresh", response_model=Token)
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # Refresh logic to be fully implemented, return dummy for now to make it valid
    from app.core.security import decode_access_token, create_access_token
    from app.core.exceptions import UnauthorizedException
    
    try:
        payload = decode_access_token(req.refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid token type")
        
        new_token = create_access_token(subject=payload.get("sub"), org_id=payload.get("org_id"))
        return {"access_token": new_token, "refresh_token": req.refresh_token, "token_type": "bearer"}
    except Exception:
        raise UnauthorizedException("Invalid or expired refresh token")

@router.post("/logout")
async def logout(current_user = Depends(get_current_user_and_org)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user_and_org)):
    user, org = current_user
    # Additional roles extraction could be done here
    return user

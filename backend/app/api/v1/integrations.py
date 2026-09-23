from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.db.session import get_db
from app.schemas.integration import IntegrationResponse, IntegrationCreate, IntegrationUpdate
from app.models.integration import Integration
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission

router = APIRouter()

@router.get("", response_model=List[IntegrationResponse], dependencies=[Depends(require_permission('settings', 'update'))])
async def list_integrations(
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    result = await db.execute(
        select(Integration).filter(Integration.organization_id == org.id)
    )
    return result.scalars().all()

@router.post("", response_model=IntegrationResponse, dependencies=[Depends(require_permission('settings', 'update'))])
async def create_integration(
    req: IntegrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    integration = Integration(
        organization_id=org.id,
        **req.model_dump()
    )
    db.add(integration)
    await db.commit()
    await db.refresh(integration)
    return integration

@router.get("/{id}", response_model=IntegrationResponse, dependencies=[Depends(require_permission('settings', 'update'))])
async def get_integration(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    result = await db.execute(
        select(Integration).filter(Integration.id == id, Integration.organization_id == org.id)
    )
    integration = result.scalars().first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return integration

@router.put("/{id}", response_model=IntegrationResponse, dependencies=[Depends(require_permission('settings', 'update'))])
async def update_integration(
    id: UUID,
    req: IntegrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    result = await db.execute(
        select(Integration).filter(Integration.id == id, Integration.organization_id == org.id)
    )
    integration = result.scalars().first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(integration, key, value)
        
    await db.commit()
    await db.refresh(integration)
    return integration

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('settings', 'update'))])
async def delete_integration(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_and_org = Depends(get_current_user_and_org)
):
    _, org = current_user_and_org
    result = await db.execute(
        select(Integration).filter(Integration.id == id, Integration.organization_id == org.id)
    )
    integration = result.scalars().first()
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
        
    await db.delete(integration)
    await db.commit()

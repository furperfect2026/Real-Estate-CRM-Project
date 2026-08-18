from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.schemas.team import TeamResponse, TeamCreate, TeamUpdate, TeamMemberAdd, TeamMemberResponse
from app.services.team_service import TeamService
from app.dependencies import get_current_user_and_org
from app.core.permissions import require_permission

router = APIRouter()

@router.get("", response_model=List[TeamResponse], dependencies=[Depends(require_permission('teams', 'view'))])
async def list_teams(db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    return await service.list_teams()

@router.post("", response_model=TeamResponse, dependencies=[Depends(require_permission('teams', 'create'))])
async def create_team(req: TeamCreate, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    return await service.create_team(req)

@router.put("/{id}", response_model=TeamResponse, dependencies=[Depends(require_permission('teams', 'update'))])
async def update_team(id: UUID, req: TeamUpdate, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    return await service.update_team(id, req)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('teams', 'delete'))])
async def delete_team(id: UUID, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    await service.delete_team(id)

@router.get("/{id}/members", response_model=List[TeamMemberResponse], dependencies=[Depends(require_permission('teams', 'view'))])
async def get_team_members(id: UUID, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    return await service.get_team_members(id)

@router.post("/{id}/members", response_model=TeamMemberResponse, dependencies=[Depends(require_permission('teams', 'update'))])
async def add_team_member(id: UUID, req: TeamMemberAdd, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    return await service.add_team_member(id, req.user_id, req.role_in_team)

@router.delete("/{id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_permission('teams', 'update'))])
async def remove_team_member(id: UUID, user_id: UUID, db: AsyncSession = Depends(get_db), current_user_and_org = Depends(get_current_user_and_org)):
    _, org = current_user_and_org
    service = TeamService(db, org.id)
    await service.remove_team_member(id, user_id)

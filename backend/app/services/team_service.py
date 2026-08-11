from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.team import Team, TeamMember
from app.models.user import User
from app.schemas.team import TeamCreate, TeamUpdate
from app.core.exceptions import NotFoundException

class TeamService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    async def list_teams(self):
        result = await self.db.execute(select(Team).filter(Team.organization_id == self.org_id))
        return result.scalars().all()

    async def create_team(self, data: TeamCreate) -> Team:
        team = Team(organization_id=self.org_id, **data.model_dump())
        self.db.add(team)
        await self.db.commit()
        await self.db.refresh(team)
        return team

    async def update_team(self, team_id: UUID, data: TeamUpdate) -> Team:
        result = await self.db.execute(select(Team).filter(Team.id == team_id, Team.organization_id == self.org_id))
        team = result.scalars().first()
        if not team:
            raise NotFoundException("Team not found")
            
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(team, key, value)
            
        await self.db.commit()
        await self.db.refresh(team)
        return team

    async def delete_team(self, team_id: UUID) -> None:
        result = await self.db.execute(select(Team).filter(Team.id == team_id, Team.organization_id == self.org_id))
        team = result.scalars().first()
        if not team:
            raise NotFoundException("Team not found")
        await self.db.delete(team)
        await self.db.commit()

    async def get_team_members(self, team_id: UUID):
        result = await self.db.execute(select(TeamMember).filter(TeamMember.team_id == team_id))
        return result.scalars().all()

    async def add_team_member(self, team_id: UUID, user_id: UUID, role_in_team: str = None) -> TeamMember:
        member = TeamMember(team_id=team_id, user_id=user_id, role_in_team=role_in_team)
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(member)
        return member

    async def remove_team_member(self, team_id: UUID, user_id: UUID) -> None:
        result = await self.db.execute(select(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id))
        member = result.scalars().first()
        if not member:
            raise NotFoundException("Member not found")
        await self.db.delete(member)
        await self.db.commit()

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, date, timezone
from app.models.user import User
from app.models.team import Team
from app.models.task import Task
from app.core.exceptions import NotFoundException

class DashboardService:
    def __init__(self, db: AsyncSession, org_id: UUID):
        self.db = db
        self.org_id = org_id

    async def get_stats(self) -> dict:
        today = datetime.now(timezone.utc).date()
        
        # Totals
        total_users = await self.db.execute(select(func.count(User.id)).filter(User.organization_id == self.org_id, User.deleted_at.is_(None)))
        total_teams = await self.db.execute(select(func.count(Team.id)).filter(Team.organization_id == self.org_id))
        total_tasks = await self.db.execute(select(func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.deleted_at.is_(None)))
        
        # Specific tasks
        tasks_today = await self.db.execute(select(func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.due_date == today, Task.deleted_at.is_(None)))
        tasks_overdue = await self.db.execute(select(func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.due_date < today, Task.status != 'COMPLETED', Task.deleted_at.is_(None)))
        tasks_completed = await self.db.execute(select(func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.status == 'COMPLETED', Task.deleted_at.is_(None)))
        
        # Group by
        tasks_by_status = await self.db.execute(select(Task.status, func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.deleted_at.is_(None)).group_by(Task.status))
        tasks_by_priority = await self.db.execute(select(Task.priority, func.count(Task.id)).filter(Task.organization_id == self.org_id, Task.deleted_at.is_(None)).group_by(Task.priority))
        
        return {
            "total_users": total_users.scalar() or 0,
            "total_teams": total_teams.scalar() or 0,
            "total_tasks": total_tasks.scalar() or 0,
            "tasks_today": tasks_today.scalar() or 0,
            "tasks_overdue": tasks_overdue.scalar() or 0,
            "tasks_completed": tasks_completed.scalar() or 0,
            "tasks_by_status": {k: v for k, v in tasks_by_status.all()},
            "tasks_by_priority": {k: v for k, v in tasks_by_priority.all()}
        }

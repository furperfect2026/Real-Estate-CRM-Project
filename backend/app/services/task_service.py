from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_
from uuid import UUID
from datetime import datetime, timezone
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.core.exceptions import NotFoundException

class TaskService:
    def __init__(self, db: AsyncSession, org_id: UUID, user_id: UUID):
        self.db = db
        self.org_id = org_id
        self.user_id = user_id

    async def create_task(self, req: TaskCreate) -> Task:
        task = Task(
            organization_id=self.org_id,
            assigned_by=self.user_id,
            **req.model_dump()
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_task(self, task_id: UUID) -> Task:
        result = await self.db.execute(select(Task).filter(Task.id == task_id, Task.organization_id == self.org_id, Task.deleted_at.is_(None)))
        task = result.scalars().first()
        if not task:
            raise NotFoundException("Task not found")
        return task

    async def update_task(self, task_id: UUID, req: TaskUpdate) -> Task:
        task = await self.get_task(task_id)
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete_task(self, task_id: UUID) -> None:
        task = await self.get_task(task_id)
        task.deleted_at = datetime.now(timezone.utc)
        await self.db.commit()

    def get_tasks_query(self, filters: dict = {}):
        query = select(Task).filter(Task.organization_id == self.org_id, Task.deleted_at.is_(None))
        if filters.get("assigned_to"):
            query = query.filter(Task.assigned_to == filters["assigned_to"])
        if filters.get("status"):
            query = query.filter(Task.status == filters["status"])
        return query

    def get_my_tasks(self):
        return self.get_tasks_query({"assigned_to": self.user_id})
        
    def get_today_tasks(self):
        today = datetime.now(timezone.utc).date()
        return select(Task).filter(
            Task.organization_id == self.org_id, 
            Task.deleted_at.is_(None),
            Task.assigned_to == self.user_id,
            Task.due_date == today
        )
        
    def get_overdue_tasks(self):
        today = datetime.now(timezone.utc).date()
        return select(Task).filter(
            Task.organization_id == self.org_id, 
            Task.deleted_at.is_(None),
            Task.assigned_to == self.user_id,
            Task.due_date < today,
            Task.status.not_in(['COMPLETED', 'CANCELLED'])
        )

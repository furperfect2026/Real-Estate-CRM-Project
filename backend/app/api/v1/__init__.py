from fastapi import APIRouter
from app.api.v1 import auth, users, tasks, organizations, dashboard, roles, teams, pipelines, leads, integrations, webhooks, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(pipelines.router, prefix="/pipelines", tags=["pipelines"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

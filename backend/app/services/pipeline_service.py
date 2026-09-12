from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime, timezone
from app.models.pipeline import Pipeline, PipelineStage
from app.schemas.pipeline import PipelineCreate, PipelineUpdate, PipelineStageCreate, PipelineStageUpdate
from app.core.exceptions import NotFoundException

class PipelineService:
    def __init__(self, db: AsyncSession, org_id: UUID, user_id: UUID):
        self.db = db
        self.org_id = org_id
        self.user_id = user_id

    async def create_pipeline(self, req: PipelineCreate) -> Pipeline:
        pipeline = Pipeline(
            organization_id=self.org_id,
            **req.model_dump()
        )
        self.db.add(pipeline)
        await self.db.commit()
        await self.db.refresh(pipeline)
        return pipeline

    async def get_pipeline(self, pipeline_id: UUID) -> Pipeline:
        result = await self.db.execute(
            select(Pipeline)
            .options(selectinload(Pipeline.stages))
            .filter(Pipeline.id == pipeline_id, Pipeline.organization_id == self.org_id)
        )
        pipeline = result.scalars().first()
        if not pipeline:
            raise NotFoundException("Pipeline not found")
        return pipeline

    async def update_pipeline(self, pipeline_id: UUID, req: PipelineUpdate) -> Pipeline:
        pipeline = await self.get_pipeline(pipeline_id)
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(pipeline, key, value)
        await self.db.commit()
        await self.db.refresh(pipeline)
        return pipeline

    async def delete_pipeline(self, pipeline_id: UUID) -> None:
        pipeline = await self.get_pipeline(pipeline_id)
        await self.db.delete(pipeline)
        await self.db.commit()

    def get_pipelines_query(self):
        return select(Pipeline).options(selectinload(Pipeline.stages)).filter(Pipeline.organization_id == self.org_id)

    async def create_stage(self, pipeline_id: UUID, req: PipelineStageCreate) -> PipelineStage:
        # Verify pipeline exists in org
        await self.get_pipeline(pipeline_id)
        stage = PipelineStage(
            pipeline_id=pipeline_id,
            **req.model_dump()
        )
        self.db.add(stage)
        await self.db.commit()
        await self.db.refresh(stage)
        return stage

    async def get_stage(self, pipeline_id: UUID, stage_id: UUID) -> PipelineStage:
        await self.get_pipeline(pipeline_id)
        result = await self.db.execute(
            select(PipelineStage)
            .filter(PipelineStage.id == stage_id, PipelineStage.pipeline_id == pipeline_id)
        )
        stage = result.scalars().first()
        if not stage:
            raise NotFoundException("Pipeline stage not found")
        return stage

    async def update_stage(self, pipeline_id: UUID, stage_id: UUID, req: PipelineStageUpdate) -> PipelineStage:
        stage = await self.get_stage(pipeline_id, stage_id)
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(stage, key, value)
        await self.db.commit()
        await self.db.refresh(stage)
        return stage

    async def delete_stage(self, pipeline_id: UUID, stage_id: UUID) -> None:
        stage = await self.get_stage(pipeline_id, stage_id)
        await self.db.delete(stage)
        await self.db.commit()

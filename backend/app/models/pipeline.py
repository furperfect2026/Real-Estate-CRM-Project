from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.base_model import BaseModel
from sqlalchemy.orm import relationship

class Pipeline(BaseModel):
    __tablename__ = 'pipelines'
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    name = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    
    stages = relationship("PipelineStage", back_populates="pipeline", cascade="all, delete-orphan")

class PipelineStage(BaseModel):
    __tablename__ = 'pipeline_stages'
    
    pipeline_id = Column(UUID(as_uuid=True), ForeignKey('pipelines.id'), nullable=False)
    name = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    color = Column(String, nullable=True)
    
    pipeline = relationship("Pipeline", back_populates="stages")

# backend/app/models/scraper_config.py

from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class ScraperConfig(Base):
    __tablename__ = "scraper_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g., "buzzfeed"
    template = Column(String, nullable=False)  # e.g., "news_site"
    url = Column(String, nullable=False)
    base_url = Column(String, nullable=True)
    selectors = Column(JSON, nullable=False)  # CSS selectors as JSON
    enabled = Column(Boolean, default=True)
    limit = Column(Integer, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
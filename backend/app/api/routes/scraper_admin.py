from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import SessionLocal
from app.models.scraper_config import ScraperConfig
from firebase_admin import auth, firestore

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def verify_admin(authorization: str = Header(None)):
    """Verify Firebase admin token and check admin status"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.split("Bearer ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token["uid"]
        
        db = firestore.client()
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            raise HTTPException(status_code=403, detail="User not found")
        
        user_data = user_doc.to_dict()
        if not user_data.get('isAdmin', False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


class ScraperConfigCreate(BaseModel):
    name: str
    template: str
    url: str
    base_url: str = None
    selectors: dict
    enabled: bool = True
    limit: int = 10


class ScraperConfigUpdate(BaseModel):
    template: str = None
    url: str = None
    base_url: str = None
    selectors: dict = None
    enabled: bool = None
    limit: int = None


@router.get("/admin/scrapers")
async def get_all_scrapers(
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Get all scraper configurations"""
    scrapers = db.query(ScraperConfig).all()
    return {
        "total": len(scrapers),
        "scrapers": scrapers
    }


@router.post("/admin/scrapers")
async def create_scraper(
    config: ScraperConfigCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Create new scraper configuration"""
    existing = db.query(ScraperConfig).filter(
        ScraperConfig.name == config.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Scraper with this name already exists"
        )
    
    scraper = ScraperConfig(
        name=config.name,
        template=config.template,
        url=config.url,
        base_url=config.base_url,
        selectors=config.selectors,
        enabled=config.enabled,
        limit=config.limit
    )
    
    db.add(scraper)
    db.commit()
    db.refresh(scraper)
    
    return {
        "success": True,
        "message": "Scraper created successfully",
        "scraper": scraper
    }


@router.put("/admin/scrapers/{scraper_id}")
async def update_scraper(
    scraper_id: int,
    config: ScraperConfigUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Update scraper configuration"""
    scraper = db.query(ScraperConfig).filter(
        ScraperConfig.id == scraper_id
    ).first()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    
    if config.template is not None:
        scraper.template = config.template
    if config.url is not None:
        scraper.url = config.url
    if config.base_url is not None:
        scraper.base_url = config.base_url
    if config.selectors is not None:
        scraper.selectors = config.selectors
    if config.enabled is not None:
        scraper.enabled = config.enabled
    if config.limit is not None:
        scraper.limit = config.limit
    
    db.commit()
    db.refresh(scraper)
    
    return {
        "success": True,
        "message": "Scraper updated successfully",
        "scraper": scraper
    }


@router.delete("/admin/scrapers/{scraper_id}")
async def delete_scraper(
    scraper_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Delete scraper configuration"""
    scraper = db.query(ScraperConfig).filter(
        ScraperConfig.id == scraper_id
    ).first()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    
    db.delete(scraper)
    db.commit()
    
    return {
        "success": True,
        "message": "Scraper deleted successfully"
    }


@router.post("/admin/scrapers/{scraper_id}/toggle")
async def toggle_scraper(
    scraper_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Enable or disable a scraper"""
    scraper = db.query(ScraperConfig).filter(
        ScraperConfig.id == scraper_id
    ).first()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    
    scraper.enabled = not scraper.enabled
    db.commit()
    db.refresh(scraper)
    
    status = "enabled" if scraper.enabled else "disabled"
    return {
        "success": True,
        "message": f"Scraper {status}",
        "scraper": scraper
    }


@router.post("/admin/scrapers/test/{scraper_id}")
async def test_scraper(
    scraper_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(verify_admin)
):
    """Test a scraper configuration without saving results"""
    scraper = db.query(ScraperConfig).filter(
        ScraperConfig.id == scraper_id
    ).first()
    
    if not scraper:
        raise HTTPException(status_code=404, detail="Scraper not found")
    
    try:
        if scraper.template == 'simple_html':
            from app.scrapers.templates.simple_html import scrape
        elif scraper.template == 'news_site':
            from app.scrapers.templates.news_site import scrape
        elif scraper.template == 'reddit_style':
            from app.scrapers.templates.reddit_style import scrape
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown template: {scraper.template}"
            )
        
        config_dict = {
            'name': scraper.name,
            'url': scraper.url,
            'base_url': scraper.base_url,
            'selectors': scraper.selectors,
            'limit': min(scraper.limit, 3)
        }
        
        items = scrape(config_dict)
        
        return {
            "success": True,
            "message": f"Scraper test successful - found {len(items)} items",
            "items": items[:3]
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
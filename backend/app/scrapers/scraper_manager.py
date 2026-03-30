from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.scraper_config import ScraperConfig
from app.models.raw_data import RawData
from datetime import datetime


class ScraperManager:
    """Manages all scrapers based on database configuration"""
    
    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()
        self.scraper_templates = {
            'simple_html': self._load_simple_html_scraper,
            'reddit_style': self._load_reddit_scraper,
            'news_site': self._load_news_scraper,
        }
    
    def _load_simple_html_scraper(self):
        """Lazy load simple HTML scraper"""
        from app.scrapers.templates.simple_html import scrape
        return scrape
    
    def _load_reddit_scraper(self):
        """Lazy load Reddit scraper"""
        from app.scrapers.templates.reddit_style import scrape
        return scrape
    
    def _load_news_scraper(self):
        """Lazy load news site scraper"""
        from app.scrapers.templates.news_site import scrape
        return scrape
    
    def get_enabled_scrapers(self) -> List[ScraperConfig]:
        """Get all enabled scrapers from database"""
        return self.db.query(ScraperConfig).filter(
            ScraperConfig.enabled == True
        ).all()
    
    def get_scraper_by_id(self, scraper_id: int) -> Optional[ScraperConfig]:
        """Get a specific scraper by ID"""
        return self.db.query(ScraperConfig).filter(
            ScraperConfig.id == scraper_id
        ).first()
    
    def get_scraper_by_name(self, name: str) -> Optional[ScraperConfig]:
        """Get a specific scraper by name"""
        return self.db.query(ScraperConfig).filter(
            ScraperConfig.name == name
        ).first()
    
    def run_all(self):
        """Run all enabled scrapers"""
        scrapers = self.get_enabled_scrapers()
        total_collected = 0
        
        print(f"\n{'='*80}")
        print(f"🚀 Starting TAPIN Scraper")
        print(f"📊 Running {len(scrapers)} enabled scrapers")
        print(f"{'='*80}\n")
        
        for scraper_config in scrapers:
            try:
                count = self._run_scraper(scraper_config)
                total_collected += count
                
            except Exception as e:
                print(f"❌ {scraper_config.name} failed: {e}\n")
                continue
        
        print(f"\n{'='*80}")
        print(f"✅ Scraping Complete!")
        print(f"📊 Total items collected: {total_collected}")
        print(f"{'='*80}\n")
        
        return total_collected
    
    def run_single(self, scraper_id: int = None, scraper_name: str = None):
        """Run a specific scraper by ID or name"""
        if scraper_id:
            scraper_config = self.get_scraper_by_id(scraper_id)
        elif scraper_name:
            scraper_config = self.get_scraper_by_name(scraper_name)
        else:
            print("❌ Must provide either scraper_id or scraper_name")
            return 0
        
        if not scraper_config:
            print(f"❌ Scraper not found")
            return 0
        
        if not scraper_config.enabled:
            print(f"⚠️  Scraper '{scraper_config.name}' is disabled")
            return 0
        
        print(f"\n{'='*80}")
        print(f"🚀 Running Single Scraper: {scraper_config.name}")
        print(f"{'='*80}\n")
        
        try:
            count = self._run_scraper(scraper_config)
            
            print(f"\n{'='*80}")
            print(f"✅ Scraping Complete!")
            print(f"📊 Total items collected: {count}")
            print(f"{'='*80}\n")
            
            return count
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return 0
    
    def _run_scraper(self, scraper_config: ScraperConfig) -> int:
        """Run a single scraper and save results to database"""
        print(f"📡 Scraping: {scraper_config.name}")
        print(f"   Template: {scraper_config.template}")
        print(f"   URL: {scraper_config.url}")
        
        loader = self.scraper_templates.get(scraper_config.template)
        
        if not loader:
            print(f"⚠️  Unknown template: {scraper_config.template}")
            return 0
        
        scrape_function = loader()
        
        config_dict = {
            'name': scraper_config.name,
            'url': scraper_config.url,
            'base_url': scraper_config.base_url,
            'selectors': scraper_config.selectors,
            'limit': scraper_config.limit
        }
        
        items = scrape_function(config_dict)
        
        saved_count = 0
        for item in items:
            try:
                raw_data = RawData(
                    source=scraper_config.name,
                    content=item.get('content', item.get('title', '')),
                    url=item.get('url'),
                    extra_data=item,
                    collected_at=datetime.utcnow()
                )
                self.db.add(raw_data)
                saved_count += 1
                
            except Exception as e:
                print(f"   ⚠️  Failed to save item: {e}")
                continue
        
        self.db.commit()
        
        print(f"   ✅ Collected: {len(items)} items")
        print(f"   💾 Saved: {saved_count} items\n")
        
        return saved_count
    
    def test_scraper(self, scraper_id: int = None, scraper_name: str = None) -> Dict:
        """Test a scraper without saving to database"""
        if scraper_id:
            scraper_config = self.get_scraper_by_id(scraper_id)
        elif scraper_name:
            scraper_config = self.get_scraper_by_name(scraper_name)
        else:
            return {"success": False, "error": "Must provide scraper_id or scraper_name"}
        
        if not scraper_config:
            return {"success": False, "error": "Scraper not found"}
        
        print(f"🧪 Testing scraper: {scraper_config.name}")
        
        try:
            loader = self.scraper_templates.get(scraper_config.template)
            
            if not loader:
                return {
                    "success": False,
                    "error": f"Unknown template: {scraper_config.template}"
                }
            
            scrape_function = loader()
            
            config_dict = {
                'name': scraper_config.name,
                'url': scraper_config.url,
                'base_url': scraper_config.base_url,
                'selectors': scraper_config.selectors,
                'limit': min(scraper_config.limit, 3)
            }
            
            items = scrape_function(config_dict)
            
            print(f"   ✅ Test successful: Found {len(items)} items\n")
            
            return {
                "success": True,
                "message": f"Found {len(items)} items",
                "items": items[:3],
                "total_found": len(items)
            }
            
        except Exception as e:
            print(f"   ❌ Test failed: {e}\n")
            return {
                "success": False,
                "error": str(e)
            }
    
    def close(self):
        """Close database connection"""
        if self.db:
            self.db.close()


def run_all_scrapers():
    """Convenience function to run all scrapers"""
    manager = ScraperManager()
    try:
        return manager.run_all()
    finally:
        manager.close()


def run_single_scraper(scraper_id: int = None, scraper_name: str = None):
    """Convenience function to run a single scraper"""
    manager = ScraperManager()
    try:
        return manager.run_single(scraper_id=scraper_id, scraper_name=scraper_name)
    finally:
        manager.close()


def test_scraper(scraper_id: int = None, scraper_name: str = None):
    """Convenience function to test a scraper"""
    manager = ScraperManager()
    try:
        return manager.test_scraper(scraper_id=scraper_id, scraper_name=scraper_name)
    finally:
        manager.close()
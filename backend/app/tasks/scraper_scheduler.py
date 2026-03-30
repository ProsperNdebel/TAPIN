from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime

scheduler = BackgroundScheduler()

def run_scrapers():
    """Run all scrapers"""
    try:
        print(f"\n🔄 Starting weekly scrapers at {datetime.utcnow().isoformat()}")
        
        from app.scrapers.scraper_manager import run_all_scrapers
        run_all_scrapers()
        
        print(f"✅ Weekly scrapers completed at {datetime.utcnow().isoformat()}")
    except Exception as e:
        print(f"❌ Scraper error: {str(e)}")

def start_scraper_scheduler():
    """Start the background scheduler for scraper tasks"""
    try:
        # Run every Friday at 2 AM UTC
        scheduler.add_job(
            run_scrapers,
            CronTrigger(hour=2, minute=0, day_of_week='fri'),
            id='weekly_scrapers',
            name='Run weekly scrapers',
            replace_existing=True,
            misfire_grace_time=3600
        )
        
        print("✅ Scraper scheduler started successfully")
        print("📅 Scrapers will run every Friday at 2:00 AM UTC")
        
        if not scheduler.running:
            scheduler.start()
    except Exception as e:
        print(f"❌ Error starting scraper scheduler: {str(e)}")

def stop_scraper_scheduler():
    """Stop the background scheduler"""
    try:
        if scheduler.running:
            scheduler.shutdown(wait=False)
            print("✅ Scraper scheduler stopped")
    except Exception as e:
        print(f"⚠️  Error stopping scheduler: {str(e)}")
# backend/app/tasks/ai_scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.ai.trend_processor import run_trend_processor

scheduler = BackgroundScheduler()

def start_ai_scheduler():
    """Start AI trend processing scheduler"""
    try:
        # Run every Friday at 6 AM UTC (after scrapers finish)
        scheduler.add_job(
            run_trend_processor,
            CronTrigger(hour=6, minute=0, day_of_week='fri'),
            id='weekly_ai_processor',
            name='Process trends with AI',
            replace_existing=True,
            misfire_grace_time=3600
        )
        
        print("✅ AI processor scheduler started")
        print("📅 Will run every Friday at 6:00 AM UTC")
        
        if not scheduler.running:
            scheduler.start()
    except Exception as e:
        print(f"❌ Error starting AI scheduler: {e}")
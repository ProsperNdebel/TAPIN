from app.core.database import engine, Base
from app.models.raw_data import RawData
from app.models.scraper_config import ScraperConfig
from app.models.category import Category

print("Creating all database tables...")
Base.metadata.create_all(bind=engine)
print("✅ All tables created successfully!")

# Verify tables were created
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()

print(f"\n📋 Tables created:")
for table in tables:
    print(f"  ✅ {table}")

# Check if scraper_configs exists
if 'scraper_configs' in tables:
    print("\n✅ scraper_configs table is ready!")
    columns = inspector.get_columns('scraper_configs')
    print(f"   Columns: {[col['name'] for col in columns]}")
else:
    print("\n❌ scraper_configs table was NOT created!")
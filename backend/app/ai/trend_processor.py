# backend/app/ai/trend_processor.py

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from anthropic import Anthropic
from app.models.raw_data import RawData
from app.models.trend import Trend
from app.models.category import Category
import json
import os


class TrendProcessor:
    """AI Agent to analyze raw data and generate curated trends"""
    
    def __init__(self, db: Session):
        self.db = db
        self.client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    
    def get_or_create_category(self, category_name):
        """Get category by name or create if doesn't exist"""
        category = self.db.query(Category).filter(
            Category.name.ilike(category_name)
        ).first()
        
        if not category:
            category = Category(name=category_name)
            self.db.add(category)
            self.db.commit()
            self.db.refresh(category)
            print(f"  ➕ Created new category: {category_name}")
        
        return category
    
    def get_unprocessed_data(self, days=7, limit=100):
        """Get raw data from last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        raw_data = self.db.query(RawData).filter(
            RawData.collected_at >= cutoff_date
        ).order_by(RawData.collected_at.desc()).limit(limit).all()
        
        return raw_data
    
    def prepare_data_for_analysis(self, raw_data):
        """Format raw data for AI analysis"""
        data_summary = []
        
        for item in raw_data:
            summary = {
                'source': item.source,
                'content': item.content[:300],
                'url': item.url,
                'extra': item.extra_data
            }
            data_summary.append(summary)
        
        return data_summary
    
    def analyze_trends(self, raw_data):
        """Send data to Claude for trend analysis"""
        data_summary = self.prepare_data_for_analysis(raw_data)
        
        prompt = f"""You are a Gen Z cultural analyst helping parents and teachers understand trending topics.

Analyze these {len(data_summary)} posts/articles/videos from the past week.

Your task:
1. Identify 5-10 emerging trends that parents/teachers should know about
2. For each trend, provide:
   - title (catchy, 3-5 words)
   - category (one of: Slang, Social Media, News, Fashion, Music, Gaming, Mental Health, Politics, Technology)
   - description (2-3 sentences explaining what it is)
   - why_it_matters (2-3 sentences for parents/teachers - why should they care?)
   - how_to_talk_about_it (1-2 sentences - conversation starters)
   - examples (2-3 concrete examples from the data)
   - relevance_score (0-100, how important is this trend?)
   - sources (URLs from the data where this trend appears)

Focus on:
- New slang or phrases that are spreading
- Social media challenges or viral content
- Cultural moments or movements
- Changes in how Gen Z communicates
- Topics that might concern or confuse adults

Return ONLY valid JSON in this exact format:
{{
  "trends": [
    {{
      "title": "Rizz",
      "category": "Slang",
      "description": "Short for 'charisma', refers to someone's ability to attract or charm others, especially romantically.",
      "why_it_matters": "This term has completely replaced traditional dating language among Gen Z. Understanding it helps adults connect with how young people talk about relationships and social dynamics.",
      "how_to_talk_about_it": "Ask them 'Who has the most rizz in your friend group?' or 'Have you been working on your rizz?' It shows you're making an effort to understand their language.",
      "examples": ["He's got that unspoken rizz", "She rizzed him up", "W rizz move"],
      "relevance_score": 85,
      "sources": ["https://urbandictionary.com/...", "https://reddit.com/..."]
    }}
  ]
}}

Raw data:
{json.dumps(data_summary, indent=2)}

Remember: Return ONLY the JSON, no preamble, no markdown backticks, no explanation.
"""
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=8000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            
            # Clean response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON
            trends_data = json.loads(response_text)
            return trends_data.get('trends', [])
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON response: {e}")
            print(f"Response: {response_text[:200]}...")
            return []
        except Exception as e:
            print(f"❌ Error analyzing trends: {e}")
            return []
    
    def save_trends(self, trends_data):
        """Save analyzed trends to database"""
        week_start = datetime.utcnow() - timedelta(days=7)
        week_end = datetime.utcnow()
        
        saved_count = 0
        
        for trend_data in trends_data:
            try:
                # Check if trend already exists this week
                existing = self.db.query(Trend).filter(
                    Trend.title == trend_data['title'],
                    Trend.week_start >= week_start,
                    Trend.week_end <= week_end
                ).first()
                
                if existing:
                    print(f"  ⏭️  Skipping '{trend_data['title']}' (already exists)")
                    continue
                
                # Get or create category
                category = self.get_or_create_category(trend_data['category'])
                
                # Prepare sources
                sources = trend_data.get('sources', [])
                sources_str = ', '.join(sources) if sources else None
                
                # Create new trend
                trend = Trend(
                    title=trend_data['title'],
                    description=trend_data['description'],
                    why_it_matters=trend_data.get('why_it_matters'),
                    how_to_talk_about_it=trend_data.get('how_to_talk_about_it'),
                    category_id=category.id,
                    relevance_score=trend_data.get('relevance_score', 0) / 100,
                    sources=sources_str,
                    week_start=week_start,
                    week_end=week_end
                )
                
                self.db.add(trend)
                saved_count += 1
                print(f"  ✅ Saved: {trend_data['title']} ({trend_data['category']})")
                
            except Exception as e:
                print(f"  ❌ Failed to save '{trend_data.get('title', 'Unknown')}': {e}")
                continue
        
        self.db.commit()
        return saved_count
    
    def process(self):
        """Main processing function"""
        print("\n" + "="*80)
        print("🤖 AI Trend Processor")
        print("="*80 + "\n")
        
        # Get raw data
        print("📊 Fetching raw data from last 7 days...")
        raw_data = self.get_unprocessed_data(days=7, limit=100)
        
        if not raw_data:
            print("⚠️  No raw data found to process")
            return 0
        
        print(f"✅ Found {len(raw_data)} items to analyze\n")
        
        # Analyze with AI
        print("🧠 Analyzing trends with Claude AI...")
        trends = self.analyze_trends(raw_data)
        
        if not trends:
            print("❌ No trends identified")
            return 0
        
        print(f"✅ Identified {len(trends)} trends\n")
        
        # Save to database
        print("💾 Saving trends to database...")
        saved_count = self.save_trends(trends)
        
        print("\n" + "="*80)
        print(f"✅ Processing complete! Saved {saved_count} trends")
        print("="*80 + "\n")
        
        return saved_count


def run_trend_processor():
    """Convenience function to run the processor"""
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        processor = TrendProcessor(db)
        return processor.process()
    finally:
        db.close()
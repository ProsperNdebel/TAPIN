import firebase_admin
from firebase_admin import credentials
from app.tasks.email_scheduler import send_weekly_digest_emails

# Initialize Firebase with service account key
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

print("🧪 Testing email scheduler with REAL Firestore data...\n")
send_weekly_digest_emails()
print("\n✅ Test completed!")

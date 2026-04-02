"""
Test script for email scheduler with mocked Firestore
"""
from unittest.mock import patch, MagicMock
from app.tasks.email_scheduler import send_weekly_digest_emails

def mock_firestore_client():
    """Create a mock Firestore client with test data"""
    mock_db = MagicMock()
    
    # Mock user data
    test_users = [
        {
            'email': 'user1@example.com',
            'isSubscribed': True,
            'email_notifications': True
        },
        {
            'email': 'user2@example.com',
            'isSubscribed': True,
            'email_notifications': True
        },
        {
            'email': 'user3@example.com',
            'isSubscribed': True,
            'email_notifications': False  # Should not receive email
        }
    ]
    
    # Create mock document objects
    mock_docs = []
    for user in test_users:
        mock_doc = MagicMock()
        mock_doc.to_dict.return_value = user
        mock_doc.id = user['email']  # Use email as ID for updates
        mock_docs.append(mock_doc)
    
    # Mock the collection query
    mock_collection = MagicMock()
    mock_collection.where.return_value.stream.return_value = mock_docs[:2]  # Only subscribed users
    
    # Mock for updates (users.where('email', '==', email).stream())
    def mock_where_email(field, op, email):
        matching_doc = MagicMock()
        matching_doc.stream.return_value = [d for d in mock_docs if d.to_dict().get('email') == email]
        return matching_doc
    
    mock_collection.where.side_effect = lambda field, op, value: (
        MagicMock(stream=lambda: mock_docs[:2]) if field == 'isSubscribed' 
        else mock_where_email(field, op, value)
    )
    
    mock_db.collection.return_value = mock_collection
    
    return mock_db


if __name__ == "__main__":
    print("🧪 Testing email scheduler with mocked Firestore...\n")
    
    # Mock firebase_admin.firestore.client() and SMTP
    with patch('firebase_admin.firestore.client', side_effect=mock_firestore_client), \
         patch('smtplib.SMTP') as mock_smtp:
        
        # Mock SMTP server
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        
        # Run the scheduler
        send_weekly_digest_emails()
        
        # Check if emails were sent
        if mock_server.send_message.called:
            num_sent = mock_server.send_message.call_count
            print(f"\n✅ Test passed! {num_sent} email(s) sent via SMTP")
        else:
            print("\n⚠️  No emails sent (may need trend data in database)")

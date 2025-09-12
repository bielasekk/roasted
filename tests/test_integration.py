import pytest
import sqlite3
import os
import app  # Import the app module

@pytest.fixture
def client():
    # Set test database path before importing app components
    test_db_path = 'test_roasted.db'
    
    # Clean up any existing test database
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    # Create test database schema
    conn = sqlite3.connect(test_db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_text TEXT NOT NULL,
            reporter TEXT,
            abusive_author TEXT,
            url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    
    # Store original DB_PATH and temporarily override it
    original_db_path = app.DB_PATH
    app.DB_PATH = test_db_path
    
    # Configure the Flask app for testing
    app.app.config['TESTING'] = True
    
    with app.app.test_client() as client:
        yield client
    
    # Restore original DB_PATH
    app.DB_PATH = original_db_path
    
    # Cleanup test database
    if os.path.exists(test_db_path):
        os.remove(test_db_path)

def test_full_report_flow(client):
    """Test complete report flow with real database"""
    response = client.post('/report', 
                         json={
                             "reportTextValue": "integration test report",
                             "reporter": "test_user",
                             "abusiveAuthor": "test_author",
                             "url": "http://test.com"
                         },
                         content_type='application/json')
    
    assert response.status_code == 200
    
    # Verify data was actually stored in the test database
    conn = sqlite3.connect(app.DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM reports")
    count = c.fetchone()[0]
    conn.close()
    
    assert count == 1
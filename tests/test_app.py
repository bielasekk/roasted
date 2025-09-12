import pytest
import json
from unittest.mock import Mock, patch
from app import app, encrypt, get_access_token

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_encrypt_decrypt():
    """Test encryption/decryption functionality"""
    from app import cipher
    test_text = "test message"
    encrypted = encrypt(test_text)
    decrypted = cipher.decrypt(encrypted.encode()).decode()
    assert decrypted == test_text

@patch('requests.post')
def test_get_access_token(mock_post):
    """Test IBM token retrieval"""
    mock_response = Mock()
    mock_response.json.return_value = {"access_token": "test_token"}
    mock_response.raise_for_status.return_value = None
    mock_post.return_value = mock_response
    
    token = get_access_token()
    assert token == "test_token"

def test_predict_endpoint(client, mocker):
    """Test the predict endpoint"""
    # Mock the IBM API call
    mock_response = Mock()
    mock_response.json.return_value = {
        "predictions": [{
            "values": [["gender", [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]]]
        }]
    }
    mock_response.raise_for_status.return_value = None
    
    mocker.patch('requests.post', return_value=mock_response)
    mocker.patch('app.get_access_token', return_value="test_token")
    
    response = client.post('/predict', 
                         json={"text": "test tweet"},
                         content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'label' in data
    assert 'probabilities' in data

def test_report_endpoint(client, mocker):
    """Test the report endpoint"""
    # Mock database connection
    mock_conn = Mock()
    mock_cursor = Mock()
    mock_conn.cursor.return_value = mock_cursor
    mocker.patch('sqlite3.connect', return_value=mock_conn)
    
    response = client.post('/report', 
                         json={
                             "reportTextValue": "test report",
                             "reporter": "test_user",
                             "abusiveAuthor": "test_author",
                             "url": "http://test.com"
                         },
                         content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["message"] == "Report stored successfully"

def test_tweet_endpoint_safe(client, mocker):
    """Test tweet endpoint with safe content"""
    # Mock prediction to return safe
    mock_prediction = Mock()
    mock_prediction.json.return_value = {"label": "not_cyberbullying"}
    mocker.patch('requests.post', return_value=mock_prediction)
    
    # Mock Twitter API
    mock_tweet = Mock()
    mock_tweet.id_str = "12345"
    mocker.patch('tweepy.API.update_status', return_value=mock_tweet)
    
    response = client.post('/tweet', 
                         json={"text": "safe tweet"},
                         content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "posted"

def test_tweet_endpoint_unsafe(client, mocker):
    """Test tweet endpoint with unsafe content"""
    # Mock prediction to return unsafe
    mock_prediction = Mock()
    mock_prediction.json.return_value = {"label": "gender"}
    mocker.patch('requests.post', return_value=mock_prediction)
    
    response = client.post('/tweet', 
                         json={"text": "unsafe tweet"},
                         content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "blocked"
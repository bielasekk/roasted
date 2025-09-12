import pytest
import requests
import time

BASE_URL = "http://localhost:5001"

def test_extension_compatibility():
    """Test that the endpoint matches Chrome extension expectations"""
    # Simulate extension request
    headers = {
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://yourextensionid'  # Mock extension origin
    }
    
    data = {
        "text": "This is a test tweet for prediction"
    }
    
    # Test both endpoints that the extension might call
    for endpoint in ['/product', '/predict']:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            json=data,
            headers=headers
        )
        
        assert response.status_code == 200
        result = response.json()
        assert 'label' in result
        assert 'probabilities' in result
        assert len(result['probabilities']) == 6

def test_cors_headers():
    """Test CORS headers for Chrome extension"""
    response = requests.options(
        f"{BASE_URL}/predict",
        headers={
            'Origin': 'chrome-extension://yourextensionid',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    )
    
    assert response.status_code == 200
    assert 'Access-Control-Allow-Origin' in response.headers
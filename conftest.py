import pytest
import os
from dotenv import load_dotenv

# Load test environment variables
load_dotenv('.env.test')

@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    """Setup environment variables for testing"""
    monkeypatch.setenv('IBM_API_KEY', 'test_api_key')
    monkeypatch.setenv('TWITTER_API_KEY', 'test_twitter_key')
    monkeypatch.setenv('TWITTER_API_SECRET', 'test_twitter_secret')
    monkeypatch.setenv('TWITTER_ACCESS_TOKEN', 'test_access_token')
    monkeypatch.setenv('TWITTER_ACCESS_SECRET', 'test_access_secret')
    monkeypatch.setenv('FERNET_KEY', 'test_fernet_key_123456789012345678901234567890=')
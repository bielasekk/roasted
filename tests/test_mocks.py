import pytest
from unittest.mock import Mock, patch
from app import twitter_client

def test_twitter_client_mock():
    """Test Twitter client with mock"""
    with patch('tweepy.API.update_status') as mock_tweet:
        mock_response = Mock()
        mock_response.id_str = "12345"
        mock_tweet.return_value = mock_response
        
        # Test the actual Twitter client method
        result = twitter_client.update_status("test tweet")
        
        assert result.id_str == "12345"
        mock_tweet.assert_called_once_with("test tweet")
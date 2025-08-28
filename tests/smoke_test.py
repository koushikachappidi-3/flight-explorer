import pytest
import requests

BASE_URL = "http://ec2-3-136-22-60.us-east-2.compute.amazonaws.com:8001"

def test_api_is_running():
    """Test that the server is running and the root endpoint is accessible."""
    try:
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        print("Server is up and running!")
    except requests.exceptions.RequestException as e:
        pytest.fail(f"Server is not accessible: {e}")

def test_get_airports_endpoint_is_working():
    """Test that a core GET endpoint returns a 200 OK status."""
    response = requests.get(f"{BASE_URL}/airports", params={'country_code': 'US'})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_airlines_endpoint_is_working():
    """Test that another core GET endpoint returns a 200 OK status."""
    response = requests.get(f"{BASE_URL}/airlines", params={'country_code': 'US'})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_routes_endpoint_is_working():
    """Test that the routes endpoint is accessible and returns a 200 OK status."""
    response = requests.get(f"{BASE_URL}/routes", params={'from': 'JFK', 'to': 'LAX'})
    assert response.status_code == 200
    data = response.json()
    assert "distance_km" in data
    assert data['distance_km'] > 0

def test_post_endpoint_is_accessible():
    """Test that a POST endpoint is accessible and returns a 400 for bad data."""
    data = {"name": "Test Airport"}
    response = requests.post(f"{BASE_URL}/airports", json=data)
    assert response.status_code == 400
    assert response.json()['error'] == 'Airport name and country are required'

import pytest
import requests

BASE_URL = "http://ec2-3-136-22-60.us-east-2.compute.amazonaws.com:8001"

# --- NEGATIVE TEST CASES ---

def test_get_airports_without_country_code_fails():
    """Test GET /airports without country_code returns a 400 error.
    This test verifies that the API returns a 400 Bad Request when the required parameter is missing.
    """
    response = requests.get(f"{BASE_URL}/airports")
    assert response.status_code == 400
    assert response.json()['error'] == 'country_code parameter is required'

def test_get_airports_invalid_country_code_fails():
    """Test GET /airports with an invalid country_code returns a 404 error.
    This test confirms the API returns a 404 Not Found when a validly formatted but non-existent
    country code is provided.
    """
    response = requests.get(f"{BASE_URL}/airports", params={'country_code': 'ZZZ'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airports found for the given country codes'

def test_wrong_http_method_on_get_airports_all():
    """Test POST request to GET /airports/all endpoint returns a 404 error."""
    response = requests.post(f"{BASE_URL}/airports/all", json={})
    assert response.status_code == 404  

def test_get_airports_search_without_params_fails():
    """Test GET /airports/search without ICAO or IATA returns a 400 error.
    This test confirms the API's validation by sending a request without the required 'icao' or 'iata'
    parameters.
    """
    response = requests.get(f"{BASE_URL}/airports/search")
    assert response.status_code == 400
    assert response.json()['error'] == 'At least one of ICAO or IATA code must be provided'

def test_get_airports_search_invalid_iata_fails():
    """Test GET /airports/search with an invalid IATA code returns a 404 error.
    This test checks that a search with a valid parameter name but a non-existent value returns a
    404 Not Found.
    """
    response = requests.get(f"{BASE_URL}/airports/search", params={'iata': 'ZZZ'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airport found for the given ICAO/IATA code'

def test_post_airports_missing_fields_fails():
    """Test POST /airports with missing fields returns a 400 error.
    This test ensures the API returns a 400 Bad Request if a new airport is posted without all of
    the required fields ('name' or 'country').
    """
    data = {"name": "Incomplete Airport"}
    response = requests.post(f"{BASE_URL}/airports", json=data)
    assert response.status_code == 400
    assert response.json()['error'] == 'Airport name and country are required'

def test_delete_airports_non_existent_fails():
    """Test DELETE /airports for a non-existent airport returns a 404 error.
    This test attempts to delete an airport that does not exist in the database, expecting a 404 Not Found.
    """
    response = requests.delete(f"{BASE_URL}/airports", params={'iata': 'DEL'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airport found to delete'

def test_delete_airports_without_code_fails():
    """Test DELETE /airports without ICAO or IATA code returns a 400 error.
    This test checks that a DELETE request without a required 'iata' or 'icao' parameter returns
    a 400 Bad Request.
    """
    response = requests.delete(f"{BASE_URL}/airports")
    assert response.status_code == 400
    assert response.json()['error'] == 'ICAO or IATA code is required for deletion'

# --- POSITIVE TEST CASES ---

def test_get_airports_with_country_code_us_succeeds():
    """Test GET /airports with country_code=US returns a list of airports.
    This test confirms a successful request returns a list of airports for the given country.
    """
    response = requests.get(f"{BASE_URL}/airports", params={'country_code': 'US'})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_all_airports_succeeds():
    """Test GET /airports/all returns a list of all airports.
    This test confirms that the endpoint returns a 200 OK status and a non-empty list of all airports.
    """
    response = requests.get(f"{BASE_URL}/airports/all")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_airports_search_valid_iata_succeeds():
    """Test GET /airports/search with a valid IATA code (JFK) returns the correct airport."""
    response = requests.get(f"{BASE_URL}/airports/search", params={'iata': 'JFK'})
    assert response.status_code == 200
    assert response.json()['iata'] == 'JFK'  

def test_post_airports_succeeds():
    """Test POST /airports adds a new airport and returns a 201 status.
    This test adds a new airport to the database and confirms a 201 Created status is returned.
    This is a destructive test, so it's a good practice to follow it with a deletion test.
    """
    data = {
        "name": "Test Airport",
        "iata": "TST",
        "country": "United States"
    }
    response = requests.post(f"{BASE_URL}/airports", json=data)
    assert response.status_code == 201
    assert response.json()['iata'] == 'TST'

def test_delete_airports_succeeds():
    """Test DELETE /airports deletes an airport and returns a success message.
    This test deletes the airport created in the previous test and asserts a 200 OK
    and the correct confirmation message.
    """
    response = requests.delete(f"{BASE_URL}/airports", params={'iata': 'TST'})
    assert response.status_code == 200
    assert response.json()['message'] == 'Airport deleted successfully'

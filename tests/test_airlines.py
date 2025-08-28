import pytest
import requests

# The base URL for your remote server on the EC2 instance.
BASE_URL = "http://ec2-3-136-22-60.us-east-2.compute.amazonaws.com:8001"

# --- NEGATIVE TEST CASES ---
def test_get_airlines_without_country_code_fails():
    """Test GET /airlines without country_code returns a 400 error.
    This test verifies that the API returns a 400 Bad Request when the required parameter is missing.
    """
    response = requests.get(f"{BASE_URL}/airlines")
    assert response.status_code == 400
    assert response.json()['error'] == 'country_code parameter is required'

def test_get_airlines_invalid_country_code_fails():
    """Test GET /airlines with an invalid country_code returns a 404 error.
    This test confirms the API returns a 404 Not Found when a validly formatted but non-existent
    country code is provided.
    """
    response = requests.get(f"{BASE_URL}/airlines", params={'country_code': 'XYZ'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airlines found for the given country codes'

def test_wrong_http_method_on_airlines_endpoint():
    """Test POST request to GET /airlines endpoint returns a 400 error.
    This test checks that attempting to use an incorrect HTTP method (POST) on a GET-only endpoint
    results in a 400 Bad Request, based on your server's current behavior.
    """
    response = requests.post(f"{BASE_URL}/airlines", data={})
    assert response.status_code == 400

def test_get_airlines_search_without_params_fails():
    """Test GET /airlines/search without ICAO or IATA returns a 400 error.
    This test confirms the API's validation by sending a request without the required 'icao' or 'iata'
    parameters.
    """
    response = requests.get(f"{BASE_URL}/airlines/search")
    assert response.status_code == 400
    assert response.json()['error'] == 'At least one of ICAO or IATA code must be provided'

def test_get_airlines_search_invalid_iata_fails():
    """Test GET /airlines/search with an invalid IATA code returns a 404 error.
    This test checks that a search with a valid parameter name but a non-existent value returns a
    404 Not Found.
    """
    response = requests.get(f"{BASE_URL}/airlines/search", params={'iata': 'ZZZ'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airline found for the given ICAO/IATA code'

def test_post_airlines_missing_fields_fails():
    """Test POST /airlines with missing required fields returns a 400 error.
    This test ensures the API returns a 400 Bad Request if a new airline is posted without all of
    the required fields ('name' or 'country').
    """
    data = {"name": "Incomplete Airline"}
    response = requests.post(f"{BASE_URL}/airlines", json=data)
    assert response.status_code == 400
    assert response.json()['error'] == 'Airline name and country are required'

def test_delete_airlines_non_existent_fails():
    """Test DELETE /airlines for a non-existent airline returns a 404 error.
    This test attempts to delete an airline that does not exist in the database, expecting a 404 Not Found.
    """
    response = requests.delete(f"{BASE_URL}/airlines", params={'iata': 'DEL'})
    assert response.status_code == 404
    assert response.json()['error'] == 'No airline found to delete'

def test_delete_airlines_without_code_fails():
    """Test DELETE /airlines without ICAO or IATA code returns a 400 error.
    This test checks that a DELETE request without a required 'iata' or 'icao' parameter returns
    a 400 Bad Request.
    """
    response = requests.delete(f"{BASE_URL}/airlines")
    assert response.status_code == 400
    assert response.json()['error'] == 'ICAO or IATA code is required for deletion'

# --- POSITIVE TEST CASES ---
# These tests confirm that the API works as expected with correct inputs.

def test_get_airlines_with_country_code_us_succeeds():
    """Test GET /airlines with country_code=US returns a list of airlines.
    This test confirms a successful request returns a list of airlines for the given country.
    """
    response = requests.get(f"{BASE_URL}/airlines", params={'country_code': 'US'})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_airlines_search_valid_iata_succeeds():
    """Test GET /airlines/search with a valid IATA code (AA) returns the correct airline.
    This test verifies that a search for a valid IATA code returns a 200 OK status and the
    correct airline object.
    """
    response = requests.get(f"{BASE_URL}/airlines/search", params={'iata': 'AA'})
    assert response.status_code == 200
    assert response.json()[0]['iata'] == 'AA'

def test_post_airlines_succeeds():
    """Test POST /airlines adds a new airline and returns a 201 status.
    This test adds a new airline to the database and confirms a 201 Created status is returned.
    This is a destructive test, so it's a good practice to follow it with a deletion test.
    """
    data = {
        "name": "Test Airlines",
        "iata": "TST",
        "country": "United States"
    }
    response = requests.post(f"{BASE_URL}/airlines", json=data)
    assert response.status_code == 201
    assert response.json()['iata'] == 'TST'

def test_delete_airlines_succeeds():
    """Test DELETE /airlines deletes an airline and returns a success message.
    This test deletes the airline created in the previous test and asserts a 200 OK
    and the correct confirmation message.
    """
    # Note: This test assumes 'TST' was successfully created by the POST test
    response = requests.delete(f"{BASE_URL}/airlines", params={'iata': 'TST'})
    assert response.status_code == 200
    assert response.json()['message'] == 'Airline deleted successfully'

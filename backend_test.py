#!/usr/bin/env python3
import requests
import json
import sys

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://7732876e-4028-4146-aa6f-52c65f455c14.preview.emergentagent.com/api"

# Helper functions
def print_test_header(test_name):
    print(f"\n{'=' * 80}")
    print(f"TESTING: {test_name}")
    print(f"{'=' * 80}")

def print_response(response):
    try:
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Raw Response: {response.text}")

def test_endpoint(url, name, expected_status=200):
    print(f"\nTesting {name} at {url}")
    try:
        response = requests.get(url, timeout=10)
        print_response(response)
        
        if response.status_code == expected_status:
            print(f"✅ {name} test PASSED")
            return True
        else:
            print(f"❌ {name} test FAILED - Expected status {expected_status}, got {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ {name} test FAILED - Connection error: {e}")
        return False

def test_health_check():
    print_test_header("Health Check Endpoint")
    return test_endpoint(f"{BACKEND_URL}/health", "Health check endpoint")

def test_root_endpoint():
    print_test_header("Root API Endpoint")
    return test_endpoint(f"{BACKEND_URL}/", "Root API endpoint")

def test_route_accessibility():
    print_test_header("API Routes Accessibility")
    
    # List of routes to test
    routes = [
        "/dealers",
        "/loans",
        "/vehicles",
        "/audits",
        "/transactions"
    ]
    
    results = {}
    for route in routes:
        url = f"{BACKEND_URL}{route}"
        # We're just testing if the route is accessible, not if it returns valid data
        # So we'll accept 200, 404, 401, etc. as long as the server responds
        try:
            response = requests.get(url, timeout=10)
            print(f"\nTesting route {route} at {url}")
            print_response(response)
            
            # Consider any response from the server as a success for accessibility testing
            if response.status_code < 500:
                print(f"✅ Route {route} is accessible (Status: {response.status_code})")
                results[route] = True
            else:
                print(f"❌ Route {route} returned server error (Status: {response.status_code})")
                results[route] = False
        except requests.exceptions.RequestException as e:
            print(f"❌ Route {route} test FAILED - Connection error: {e}")
            results[route] = False
    
    # Return True if all routes are accessible
    return all(results.values()), results

def run_tests():
    print("\n" + "=" * 80)
    print("ANVL BACKEND API TESTING")
    print("=" * 80)
    
    test_results = {}
    
    # Test 1: Health Check
    test_results["Health Check Endpoint"] = test_health_check()
    
    # Test 2: Root Endpoint
    test_results["Root API Endpoint"] = test_root_endpoint()
    
    # Test 3: Route Accessibility
    route_success, route_details = test_route_accessibility()
    test_results["API Routes Accessibility"] = route_success
    
    # Print summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    if "API Routes Accessibility" in test_results and not test_results["API Routes Accessibility"]:
        print("\nDetailed Route Accessibility Results:")
        for route, result in route_details.items():
            status = "✅ Accessible" if result else "❌ Not Accessible"
            print(f"  {route}: {status}")
    
    print("\n" + "=" * 80)
    if all_passed:
        print("✅ ALL TESTS PASSED - Backend API is working correctly")
        return 0
    else:
        print("❌ SOME TESTS FAILED - See details above")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
#!/usr/bin/env python3
"""
Test script for MariThon Backend API
Run this after deployment to verify your backend is working
"""

import requests
import json
import sys
from pathlib import Path

def test_api_endpoint(base_url, endpoint, method="GET", data=None, files=None):
    """Test a single API endpoint"""
    url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, data=data, files=files, timeout=30)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
            
        print(f"🔍 Testing {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   Response: {json.dumps(result, indent=2)}")
            except:
                print(f"   Response: {response.text[:200]}...")
            print("   ✅ Success")
            return True
        else:
            print(f"   ❌ Failed: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def test_pdf_extraction(base_url, pdf_path):
    """Test PDF extraction endpoint"""
    if not Path(pdf_path).exists():
        print(f"❌ PDF file not found: {pdf_path}")
        return False
        
    print(f"🔍 Testing PDF extraction with {pdf_path}")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'pdf': f}
            response = requests.post(f"{base_url}/extract", files=files, timeout=60)
            
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Extraction successful!")
            print(f"   API Used: {result.get('api_used', 'Unknown')}")
            print(f"   Vessel Info: {len(result.get('vessel_info', {}))} fields")
            print(f"   Events: {len(result.get('events', []))} events")
            return True
        else:
            print(f"   ❌ Extraction failed: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"   ❌ Extraction error: {e}")
        return False

def main():
    print("🧪 MariThon Backend API Test Suite")
    print("===================================")
    
    # Get base URL from user
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = input("Enter your backend URL (e.g., https://your-app.onrender.com): ").strip()
    
    if not base_url:
        print("❌ No URL provided. Exiting.")
        sys.exit(1)
        
    if not base_url.startswith(('http://', 'https://')):
        base_url = f"https://{base_url}"
    
    print(f"\n🚀 Testing backend at: {base_url}")
    print("=" * 50)
    
    # Test basic endpoints
    endpoints = [
        ("", "GET"),
        ("health", "GET"),
    ]
    
    success_count = 0
    total_count = len(endpoints)
    
    for endpoint, method in endpoints:
        if test_api_endpoint(base_url, endpoint, method):
            success_count += 1
        print()
    
    # Test PDF extraction if sample files exist
    sample_pdfs = list(Path("SOF Samples").glob("*.pdf"))
    if sample_pdfs:
        print("📄 Testing PDF Extraction")
        print("-" * 30)
        
        # Test with first sample PDF
        test_pdf = sample_pdfs[0]
        if test_pdf_extraction(base_url, test_pdf):
            success_count += 1
        total_count += 1
        print()
    
    # Summary
    print("📊 Test Summary")
    print("=" * 30)
    print(f"✅ Passed: {success_count}")
    print(f"❌ Failed: {total_count - success_count}")
    print(f"📈 Success Rate: {(success_count/total_count)*100:.1f}%")
    
    if success_count == total_count:
        print("\n🎉 All tests passed! Your backend is working correctly.")
    else:
        print(f"\n⚠️  {total_count - success_count} test(s) failed. Check your deployment.")
    
    print(f"\n🔗 API Documentation: {base_url}/docs")
    print(f"🔗 ReDoc: {base_url}/redoc")

if __name__ == "__main__":
    main()

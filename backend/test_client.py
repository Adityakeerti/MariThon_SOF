#!/usr/bin/env python3
"""
Test client for SOF Document Extractor API
Usage: python test_client.py path/to/your/sof.pdf
"""

import requests
import sys
import json
from pathlib import Path

def test_sof_extraction(pdf_path: str, api_url: str = "http://localhost:8000"):
    """Test the SOF extraction API"""
    
    # Check if file exists
    if not Path(pdf_path).exists():
        print(f"❌ File not found: {pdf_path}")
        return
    
    print(f"🔍 Testing SOF extraction for: {pdf_path}")
    print(f"📡 API URL: {api_url}")
    
    try:
        # Check API health
        health_response = requests.get(f"{api_url}/health")
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"✅ API is healthy")
            print(f"📊 Available APIs: {', '.join(health_data.get('available_apis', []))}")
        else:
            print(f"⚠️  API health check failed: {health_response.status_code}")
        
        # Extract SOF data
        with open(pdf_path, 'rb') as f:
            files = {'pdf': (Path(pdf_path).name, f, 'application/pdf')}
            
            print("\n🚀 Starting extraction...")
            response = requests.post(f"{api_url}/extract", files=files, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Extraction completed successfully!")
            print(f"🔧 API used: {result.get('api_used', 'Unknown')}")
            
            print("\n" + "="*50)
            print("📋 VESSEL INFORMATION")
            print("="*50)
            
            vessel_info = result.get('vessel_info', {})
            for key, value in vessel_info.items():
                print(f"{key:20}: {value}")
            
            print("\n" + "="*50)
            print("📅 CHRONOLOGY OF EVENTS")
            print("="*50)
            
            events = result.get('events', [])
            for i, event in enumerate(events, 1):
                print(f"\nEvent {i}:")
                for key, value in event.items():
                    print(f"  {key:15}: {value}")
            
            print(f"\n📊 Total events extracted: {len(events)}")
            
            # Save results to JSON
            output_file = Path(pdf_path).stem + "_extracted.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"💾 Results saved to: {output_file}")
            
        else:
            print(f"❌ Extraction failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running:")
        print("   python sof-extractor-apis.py")
        print("   or")
        print("   uvicorn sof-extractor-apis:app --reload")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_client.py <path_to_pdf>")
        print("Example: python test_client.py sample.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    test_sof_extraction(pdf_path)
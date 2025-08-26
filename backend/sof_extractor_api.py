# SOF Document Extractor using Multiple Free APIs
# Author: Advanced Document Processing System
# Date: August 2025

from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import base64
import json
import os
from datetime import datetime
import re
from typing import Dict, List, Optional
import asyncio
import aiohttp


app = FastAPI(title="SOF Document Extractor", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration for different APIs
class APIConfig:
    def __init__(self):
        # Azure Document Intelligence (500 pages free/month for 12 months)
        self.azure_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
        self.azure_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")
        
        # Google Document AI ($300 free credit for new users)
        self.google_project_id = os.getenv("GOOGLE_PROJECT_ID")
        self.google_location = os.getenv("GOOGLE_LOCATION", "us")  # us, eu
        self.google_processor_id = os.getenv("GOOGLE_PROCESSOR_ID")
        self.google_credentials = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        # Hugging Face (hardcoded token as requested)
        self.hf_token = "HF_TOKEN"
        
        # OpenAI/OpenRouter (Fallback)
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")

config = APIConfig()

# =============================================================================
# AZURE DOCUMENT INTELLIGENCE EXTRACTOR (BEST FOR PRODUCTION)
# =============================================================================

class AzureDocumentIntelligence:
    def __init__(self):
        self.endpoint = config.azure_endpoint
        self.key = config.azure_key
        
    async def extract_sof_data(self, pdf_bytes: bytes) -> Dict:
        """Extract SOF data using Azure Document Intelligence Layout API"""
        if not self.endpoint or not self.key:
            raise HTTPException(400, "Azure credentials not configured")
            
        headers = {
            'Ocp-Apim-Subscription-Key': self.key,
            'Content-Type': 'application/pdf'
        }
        
        # Submit document for analysis
        analyze_url = f"{self.endpoint}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-02-29-preview"
        
        async with aiohttp.ClientSession() as session:
            # Submit for analysis
            async with session.post(analyze_url, headers=headers, data=pdf_bytes) as response:
                if response.status != 202:
                    raise HTTPException(400, f"Azure API error: {response.status}")
                
                operation_location = response.headers.get('Operation-Location')
                
            # Poll for results
            result_headers = {'Ocp-Apim-Subscription-Key': self.key}
            for _ in range(30):  # Wait up to 30 seconds
                await asyncio.sleep(1)
                async with session.get(operation_location, headers=result_headers) as result_response:
                    result = await result_response.json()
                    if result['status'] == 'succeeded':
                        return self._parse_azure_result(result)
                    elif result['status'] == 'failed':
                        raise HTTPException(400, "Azure analysis failed")
            
            raise HTTPException(408, "Azure analysis timeout")
    
    def _parse_azure_result(self, azure_result: Dict) -> Dict:
        """Parse Azure Document Intelligence result into SOF format"""
        analyze_result = azure_result['analyzeResult']
        content = analyze_result.get('content', '')
        
        # Extract vessel information using patterns
        vessel_info = self._extract_vessel_info_azure(content)
        
        # Extract events from tables and content
        events = self._extract_events_azure(analyze_result)
        
        return {
            "vessel_info": vessel_info,
            "events": events
        }
    
    def _extract_vessel_info_azure(self, content: str) -> Dict:
        """Extract vessel information from Azure OCR content"""
        patterns = {
            "Vessel Name": [
                r"(?i)(?:Name of |M\.V\.|Vessel|Ship)[\s\-:]*([^\n\r]+?)(?:\n|$)",
                r"(?i)M\.V\.?\s*([^\n\r]+?)(?:\n|$)"
            ],
            "Master": [
                r"(?i)(?:Name of |Captain|Master)[\s\-:]*([^\n\r]+?)(?:\n|$)"
            ],
            "Agent": [
                r"(?i)(?:Name of |Agent)[\s\-:]*([^\n\r]+?)(?:\n|$)"
            ],
            "Port of Loading": [
                r"(?i)(?:Port of Loading|Loading Port|From)[\s\-:]*([^\n\r]+?)(?:\n|$)"
            ],
            "Port of Discharge": [
                r"(?i)(?:Port of Discharge|Discharge Port|To)[\s\-:]*([^\n\r]+?)(?:\n|$)"
            ],
            "Cargo": [
                r"(?i)(?:Cargo Description|Cargo)[\s\-:]*([^\n\r]+?)(?:Quantity|$)"
            ],
            "Quantity (MT)": [
                r"(?i)(?:Quantity|Cargo Quantity)[\s\-:]*([0-9,\.]+)",
                r"([0-9,\.]+)\s*(?:METRIC TONS|MT|Tons)"
            ]
        }
        
        vessel_info = {}
        for field, field_patterns in patterns.items():
            value = ""
            for pattern in field_patterns:
                match = re.search(pattern, content)
                if match:
                    value = match.group(1).strip()
                    break
            vessel_info[field] = value if value else "-"
        
        return vessel_info
    
    def _extract_events_azure(self, analyze_result: Dict) -> List[Dict]:
        """Extract events from Azure Document Intelligence tables"""
        events = []
        tables = analyze_result.get('tables', [])
        
        for table in tables:
            # Look for tables with date/time patterns
            if self._is_events_table(table):
                table_events = self._parse_events_table_azure(table)
                events.extend(table_events)
        
        # If no table events found, try content parsing
        if not events:
            content = analyze_result.get('content', '')
            events = self._extract_events_from_content(content)
        
        return events or [{"Date": "-", "Start Time": "-", "End Time": "-", 
                          "Duration": "-", "Event Description": "-", "Remarks": "-"}]
    
    def _is_events_table(self, table: Dict) -> bool:
        """Check if table contains event data"""
        cells = table.get('cells', [])
        content = ' '.join([cell.get('content', '') for cell in cells[:10]])  # Check first 10 cells
        return bool(re.search(r'\d{2}[./]\d{2}[./]\d{4}|\d{4}-\d{4}|TIME|DATE', content, re.IGNORECASE))
    
    def _parse_events_table_azure(self, table: Dict) -> List[Dict]:
        """Parse events from Azure table structure"""
        events = []
        cells = table.get('cells', [])
        
        # Group cells by row
        rows = {}
        for cell in cells:
            row_index = cell.get('rowIndex', 0)
            if row_index not in rows:
                rows[row_index] = []
            rows[row_index].append(cell.get('content', ''))
        
        # Parse each row
        for row_index, row_content in rows.items():
            if row_index == 0:  # Skip header
                continue
            
            event = self._parse_event_row(row_content)
            if event:
                events.append(event)
        
        return events
    
    def _parse_event_row(self, row_content: List[str]) -> Optional[Dict]:
        """Parse a single event row"""
        row_text = ' '.join(row_content)
        
        # Extract date
        date_match = re.search(r'(\d{1,2}[./]\d{1,2}[./]\d{4})', row_text)
        date_val = self._normalize_date(date_match.group(1)) if date_match else "-"
        
        # Extract time range
        time_match = re.search(r'(\d{3,4})[:\-](\d{3,4})', row_text)
        if time_match:
            start_time = self._normalize_time(time_match.group(1))
            end_time = self._normalize_time(time_match.group(2))
            duration = self._calculate_duration(start_time, end_time)
        else:
            start_time = end_time = duration = "-"
        
        # Extract description (longest text piece)
        description = max(row_content, key=len) if row_content else "-"
        
        return {
            "Date": date_val,
            "Start Time": start_time,
            "End Time": end_time,
            "Duration": duration,
            "Event Description": description.strip().title(),
            "Remarks": "-"
        }
    
    def _extract_events_from_content(self, content: str) -> List[Dict]:
        """Fallback content parsing for events"""
        events = []
        lines = content.split('\n')
        
        for line in lines:
            # Look for lines with dates and times
            if re.search(r'\d{1,2}[./]\d{1,2}[./]\d{4}.*?\d{3,4}', line):
                event = self._parse_event_line(line)
                if event:
                    events.append(event)
        
        return events
    
    def _parse_event_line(self, line: str) -> Optional[Dict]:
        """Parse event from a single line"""
        # Similar parsing logic as _parse_event_row
        date_match = re.search(r'(\d{1,2}[./]\d{1,2}[./]\d{4})', line)
        time_match = re.search(r'(\d{3,4})[:\-](\d{3,4})', line)
        
        if not date_match:
            return None
        
        date_val = self._normalize_date(date_match.group(1))
        
        if time_match:
            start_time = self._normalize_time(time_match.group(1))
            end_time = self._normalize_time(time_match.group(2))
            duration = self._calculate_duration(start_time, end_time)
        else:
            single_time = re.search(r'(\d{3,4})', line)
            start_time = self._normalize_time(single_time.group(1)) if single_time else "-"
            end_time = duration = "-"
        
        # Extract description
        desc_parts = line.split()
        description = ' '.join([part for part in desc_parts if not re.match(r'\d', part)])[:100]
        
        return {
            "Date": date_val,
            "Start Time": start_time,
            "End Time": end_time,
            "Duration": duration,
            "Event Description": description.strip().title(),
            "Remarks": "-"
        }
    
    def _normalize_date(self, date_str: str) -> str:
        """Normalize date to DD Mon YYYY format"""
        # Handle various date formats
        if '.' in date_str:
            parts = date_str.split('.')
        elif '/' in date_str:
            parts = date_str.split('/')
        else:
            return date_str
        
        if len(parts) == 3:
            day, month, year = parts
            months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            try:
                month_name = months[int(month)] if int(month) <= 12 else month
                return f"{day.zfill(2)} {month_name} {year}"
            except (ValueError, IndexError):
                return date_str
        return date_str
    
    def _normalize_time(self, time_str: str) -> str:
        """Normalize time to HH:MM format"""
        time_str = time_str.zfill(4)
        return f"{time_str[:2]}:{time_str[2:]}"
    
    def _calculate_duration(self, start_time: str, end_time: str) -> str:
        """Calculate duration between times"""
        try:
            start = datetime.strptime(start_time, '%H:%M')
            end = datetime.strptime(end_time, '%H:%M')
            if end < start:
                end = end.replace(day=end.day + 1)
            duration = (end - start).seconds / 3600
            return f"{duration:.1f}h" if duration % 1 else f"{int(duration)}h"
        except:
            return "-"

# =============================================================================
# HUGGING FACE LAYOUTLM EXTRACTOR (COMPLETELY FREE)
# =============================================================================

class HuggingFaceExtractor:
    def __init__(self):
        self.token = config.hf_token
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/layoutlm-base-uncased"
        
    async def extract_sof_data(self, pdf_bytes: bytes) -> Dict:
        """Extract using Hugging Face LayoutLM API"""
        if not self.token:
            raise HTTPException(400, "Hugging Face token not configured")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Convert PDF to images first (you'd need pdf2image for this)
        # For now, we'll use a text-based approach
        
        # Use Hugging Face Document Question Answering
        qa_url = "https://api-inference.huggingface.co/models/impira/layoutlm-document-qa"
        
        # Convert PDF bytes to base64 for API
        pdf_b64 = base64.b64encode(pdf_bytes).decode()
        
        questions = [
            "What is the vessel name?",
            "Who is the master?",
            "What is the agent name?",
            "What is the port of loading?",
            "What is the port of discharge?",
            "What is the cargo?",
            "What is the quantity?"
        ]
        
        vessel_info = {}
        field_names = ["Vessel Name", "Master", "Agent", "Port of Loading", 
                      "Port of Discharge", "Cargo", "Quantity (MT)"]
        
        async with aiohttp.ClientSession() as session:
            for i, question in enumerate(questions):
                payload = {
                    "inputs": {
                        "question": question,
                        "image": pdf_b64
                    }
                }
                
                try:
                    async with session.post(qa_url, headers=headers, json=payload) as response:
                        if response.status == 200:
                            result = await response.json()
                            answer = result.get('answer', '-')
                            vessel_info[field_names[i]] = answer
                        else:
                            vessel_info[field_names[i]] = "-"
                except:
                    vessel_info[field_names[i]] = "-"
                
                # Add delay to avoid rate limiting
                await asyncio.sleep(1)
        
        # For events, we'll use a simpler text extraction approach
        events = [{"Date": "-", "Start Time": "-", "End Time": "-", 
                  "Duration": "-", "Event Description": "HF Extraction In Progress", "Remarks": "-"}]
        
        return {
            "vessel_info": vessel_info,
            "events": events
        }

# =============================================================================
# OPENAI/GPT EXTRACTOR (FALLBACK)
# =============================================================================

class OpenAIExtractor:
    def __init__(self):
        self.api_key = config.openai_key or config.openrouter_key
        self.base_url = "https://openrouter.ai/api/v1" if config.openrouter_key else "https://api.openai.com/v1"
        
    async def extract_sof_data(self, pdf_text: str) -> Dict:
        """Extract using OpenAI GPT with structured prompt"""
        if not self.api_key:
            raise HTTPException(400, "OpenAI/OpenRouter key not configured")
        
        prompt = f"""
        Extract the following information from this Statement of Facts document and return ONLY valid JSON:

        {{
          "vessel_info": {{
            "Vessel Name": "",
            "Master": "",
            "Agent": "",
            "Port of Loading": "",
            "Port of Discharge": "",
            "Cargo": "",
            "Quantity (MT)": ""
          }},
          "events": [
            {{
              "Date": "",
              "Start Time": "",
              "End Time": "",
              "Duration": "",
              "Event Description": "",
              "Remarks": ""
            }}
          ]
        }}

        Document text:
        {pdf_text[:4000]}  # Limit to avoid token limits
        """
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek/deepseek-r1" if "openrouter" in self.base_url else "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a document extraction expert. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.base_url}/chat/completions", 
                                  headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result['choices'][0]['message']['content']
                    
                    # Clean and parse JSON
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    
                    try:
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        raise HTTPException(400, "Invalid JSON response from AI")
                else:
                    raise HTTPException(400, f"AI API error: {response.status}")

# =============================================================================
# MAIN EXTRACTION ENDPOINT WITH FALLBACK CHAIN
# =============================================================================

@app.post("/extract")
async def extract_sof(pdf: UploadFile):
    """Extract SOF data using multiple APIs with fallback"""
    if not pdf.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are supported")
    
    pdf_bytes = await pdf.read()
    
    # Try APIs in order of preference
    extractors = []
    
    # Add available extractors
    if config.azure_endpoint and config.azure_key:
        extractors.append(("Azure Document Intelligence", AzureDocumentIntelligence()))
    
    if config.hf_token:
        extractors.append(("Hugging Face", HuggingFaceExtractor()))
    
    if config.openai_key or config.openrouter_key:
        extractors.append(("OpenAI/OpenRouter", OpenAIExtractor()))
    
    if not extractors:
        raise HTTPException(500, "No API keys configured")
    
    # Try each extractor
    for name, extractor in extractors:
        try:
            print(f"Trying {name}...")
            
            if name == "OpenAI/OpenRouter":
                # For OpenAI, we need to convert PDF to text first
                # This is a simplified approach - you'd want proper PDF parsing
                text = str(pdf_bytes)[:4000]  # Simple text extraction
                result = await extractor.extract_sof_data(text)
            else:
                result = await extractor.extract_sof_data(pdf_bytes)
            
            result["api_used"] = name
            return result
            
        except Exception as e:
            print(f"{name} failed: {str(e)}")
            continue
    
    raise HTTPException(500, "All extraction methods failed")

@app.get("/")
async def root():
    return {"message": "SOF Document Extractor API v2.0", "status": "ready"}

@app.get("/health")
async def health_check():
    available_apis = []
    if config.azure_endpoint and config.azure_key:
        available_apis.append("Azure Document Intelligence")
    if config.hf_token:
        available_apis.append("Hugging Face")
    if config.openai_key or config.openrouter_key:
        available_apis.append("OpenAI/OpenRouter")
    
    return {
        "status": "healthy",
        "available_apis": available_apis,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
Simple PDF parser that works with basic dependencies
"""
import io
from typing import List, Dict, Any
import re

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

class SimplePDFParser:
    """Simple PDF parser that works with basic dependencies"""
    
    def __init__(self):
        self.last_mode = "unknown"
    
    def parse_pdf(self, content: bytes) -> List[str]:
        """Parse PDF content and return list of text lines"""
        lines = []
        
        # Try pdfplumber first (more reliable)
        if PDFPLUMBER_AVAILABLE:
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page_num, page in enumerate(pdf.pages):
                        if page.extract_text():
                            page_text = page.extract_text()
                            page_lines = page_text.split('\n')
                            for line in page_lines:
                                line = line.strip()
                                if line:  # Only add non-empty lines
                                    lines.append(line)
                    
                    if lines:
                        self.last_mode = "pdfplumber"
                        return lines
            except Exception as e:
                print(f"pdfplumber failed: {e}")
        
        # Fallback to PyPDF2
        if PYPDF2_AVAILABLE:
            try:
                pdf_file = io.BytesIO(content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    if page.extract_text():
                        page_text = page.extract_text()
                        page_lines = page_text.split('\n')
                        for line in page_lines:
                            line = line.strip()
                            if line:  # Only add non-empty lines
                                lines.append(line)
                
                if lines:
                    self.last_mode = "pypdf2"
                    return lines
            except Exception as e:
                print(f"PyPDF2 failed: {e}")
        
        # If both fail, return empty list
        self.last_mode = "failed"
        return lines

def parse_pdf_simple(content: bytes) -> List[str]:
    """Simple function to parse PDF and return text lines"""
    parser = SimplePDFParser()
    return parser.parse_pdf(content)

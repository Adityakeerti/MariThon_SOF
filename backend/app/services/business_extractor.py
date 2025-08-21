from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import yaml
import re
import os


@dataclass
class BusinessData:
    vessel: Optional[str] = None
    voyage_from: Optional[str] = None
    voyage_to: Optional[str] = None
    port: Optional[str] = None
    cargo: Optional[str] = None
    operation: Optional[str] = None
    demurrage: Optional[float] = None
    dispatch: Optional[float] = None
    rate: Optional[float] = None
    quantity: Optional[float] = None
    allowed_laytime: Optional[float] = None


class BusinessDataExtractor:
    """Extracts business data from shipping documents using pattern matching and NLP."""
    
    def __init__(self, business_data_path: str = "backend/config/business_data.yml"):
        self.business_data_path = business_data_path
        self.patterns = self._load_patterns()
    
    def _load_patterns(self) -> Dict[str, List[str]]:
        """Load business data extraction patterns from YAML."""
        # Try multiple possible paths for the config file
        possible_paths = [
            self.business_data_path,
            "config/business_data.yml",
            "../config/business_data.yml",
            "backend/config/business_data.yml",
            os.path.join(os.path.dirname(__file__), "..", "config", "business_data.yml"),
        ]
        
        for path in possible_paths:
            try:
                if os.path.exists(path):
                    with open(path, 'r', encoding='utf-8') as f:
                        data = yaml.safe_load(f) or {}
                        print(f"Loaded business data patterns from: {path}")
                        return {k: list(v or []) for k, v in data.items()}
            except Exception as e:
                print(f"Failed to load {path}: {e}")
                continue
        
        print("Warning: Could not load business_data.yml, using fallback patterns")
        return {}
    
    def extract(self, lines: List[str]) -> BusinessData:
        """Extract business data from parsed document lines."""
        if not lines:
            return BusinessData()
        
        print(f"Extracting business data from {len(lines)} lines")
        print(f"Available patterns: {list(self.patterns.keys())}")
        
        # Keep both original and lower-cased variants. We prefer line-by-line
        # extraction to avoid accidental cross-line captures like picking up
        # "report" as a match for "port" or swallowing subsequent headings.
        joined_text = '\n'.join(lines).lower()
        data = BusinessData()
        
        # Extract vessel information
        data.vessel = self._extract_vessel(joined_text, lines)
        print(f"Extracted vessel: {data.vessel}")
        
        # Extract voyage information
        data.voyage_from = self._extract_voyage_from(joined_text, lines)
        print(f"Extracted voyage_from: {data.voyage_from}")
        data.voyage_to = self._extract_voyage_to(joined_text, lines)
        print(f"Extracted voyage_to: {data.voyage_to}")
        
        # Extract port information
        data.port = self._extract_port(joined_text, lines)
        print(f"Extracted port: {data.port}")
        
        # Extract cargo information
        data.cargo = self._extract_cargo(joined_text, lines)
        print(f"Extracted cargo: {data.cargo}")
        
        # Extract operation type
        data.operation = self._extract_operation(joined_text)
        print(f"Extracted operation: {data.operation}")
        
        # Extract numerical values
        data.demurrage = self._extract_demurrage(joined_text)
        print(f"Extracted demurrage: {data.demurrage}")
        data.dispatch = self._extract_dispatch(joined_text)
        print(f"Extracted dispatch: {data.dispatch}")
        data.rate = self._extract_rate(joined_text)
        print(f"Extracted rate: {data.rate}")
        data.quantity = self._extract_quantity(joined_text)
        print(f"Extracted quantity: {data.quantity}")
        data.allowed_laytime = self._extract_allowed_laytime(joined_text)
        print(f"Extracted allowed_laytime: {data.allowed_laytime}")
        
        return data
    
    def _clean_value(self, value: str) -> str:
        """Normalize extracted textual value to a clean, human-friendly string."""
        val = (value or '').strip()
        # Remove leading linking words like "AT " often used in port lines
        val = re.sub(r'^\b(?:at|to|for)\b\s+', '', val, flags=re.IGNORECASE)
        # Collapse internal whitespace
        val = re.sub(r'\s+', ' ', val)
        return val

    def _value_after_labels(self, lines: List[str], labels: List[str]) -> Optional[str]:
        """Return the text that appears after any of the given labels.

        Supports two cases:
        1) Label and value on the same line, possibly with 0-3 filler words before the colon
           e.g., "Port of Loading Cargo: AT KOH SICHANG" → "AT KOH SICHANG"
        2) Label line with no value followed by a value on the next non-empty line
           e.g., "Name of Vessel:" then next line "M.V. ORION TRADER".
        """
        print(f"Searching for labels: {labels}")
        for idx, line in enumerate(lines):
            for label in labels:
                # Case 1: Label and value on same line (e.g., "Port: Value")
                pattern_same = rf"\b{re.escape(label)}\b(?:\s+[A-Za-z]+){{0,3}}\s*[:\-]\s*(.+)"
                m = re.search(pattern_same, line, flags=re.IGNORECASE)
                if m and m.group(1).strip():
                    result = self._clean_value(m.group(1))
                    print(f"Found label '{label}' on line {idx+1}: '{result}'")
                    return result

                # Case 2: Label ends with colon and value is on next line
                # This handles "Name of Vessel:" → "M.V. ORION TRADER"
                pattern_label_only = rf"\b{re.escape(label)}\b(?:\s+[A-Za-z]+){{0,3}}\s*:\s*$"
                if re.search(pattern_label_only, line, flags=re.IGNORECASE):
                    print(f"Found label '{label}' on line {idx+1} without value, checking next lines")
                    # Find next non-empty line
                    for j in range(idx + 1, min(idx + 4, len(lines))):
                        nxt = lines[j].strip()
                        if nxt:
                            result = self._clean_value(nxt)
                            print(f"Found value on line {j+1}: '{result}'")
                            return result
                            
                # Case 3: Label with colon and some text after (e.g., "Port of Loading Cargo: AT KOH SICHANG")
                # This handles cases where the label is longer and includes additional context
                pattern_extended = rf"\b{re.escape(label)}\b(?:\s+[A-Za-z]+){{0,5}}\s*:\s*(.+)"
                m = re.search(pattern_extended, line, flags=re.IGNORECASE)
                if m and m.group(1).strip():
                    result = self._clean_value(m.group(1))
                    print(f"Found extended label '{label}' on line {idx+1}: '{result}'")
                    return result
                    
        print(f"No matches found for labels: {labels}")
        return None

    def _extract_vessel(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract vessel name using line-based label parsing first, then fallbacks."""
        # Use patterns from YAML file
        vessel_labels = self.patterns.get('VESSEL', [])
        
        # Preferred: named labels from YAML
        label_value = self._value_after_labels(lines, vessel_labels)
        if label_value:
            return label_value
        
        # Fallback: lines that start with MV/M.V.
        for line in lines:
            mv_match = re.search(r'\b(m\.?v\.?)\s+([a-z0-9][a-z0-9\s\-]+)', line, re.IGNORECASE)
            if mv_match:
                return self._clean_value(mv_match.group(0))
        return None
    
    def _extract_voyage_from(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract origin port using line-based labels to avoid cross-line bleed."""
        voyage_from_labels = self.patterns.get('VOYAGE_FROM', [])
        return self._value_after_labels(lines, voyage_from_labels)
    
    def _extract_voyage_to(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract destination port using line-based labels to avoid cross-line bleed."""
        voyage_to_labels = self.patterns.get('VOYAGE_TO', [])
        return self._value_after_labels(lines, voyage_to_labels)
    
    def _extract_port(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract current port. Guard against matching "report" or other substrings."""
        port_labels = self.patterns.get('PORT', [])
        return self._value_after_labels(lines, port_labels)
    
    def _extract_cargo(self, text: str, lines: List[str]) -> Optional[str]:
        """Extract cargo description using line-based labels, avoiding POL/POD lines."""
        cargo_labels = self.patterns.get('CARGO', [])
        # Prefer explicit description labels first
        preferred_labels = [
            l for l in cargo_labels if re.search(r'description', l, re.IGNORECASE)
        ] or cargo_labels

        # Custom matching to ignore lines like "Port of Loading Cargo:"
        for idx, line in enumerate(lines):
            # Skip lines that are clearly about ports
            if re.search(r'port\s+of\s+(loading|discharging)', line, re.IGNORECASE):
                continue
            for label in preferred_labels:
                pattern_same = rf"\b{re.escape(label)}\b(?:\s+[A-Za-z]+){{0,5}}\s*[:\-]\s*(.+)"
                m = re.search(pattern_same, line, flags=re.IGNORECASE)
                if m and m.group(1).strip():
                    val = self._clean_value(m.group(1))
                    if val:
                        return val
                pattern_label_only = rf"\b{re.escape(label)}\b(?:\s+[A-Za-z]+){{0,5}}\s*:\s*$"
                if re.search(pattern_label_only, line, flags=re.IGNORECASE):
                    for j in range(idx + 1, min(idx + 4, len(lines))):
                        nxt = lines[j].strip()
                        if nxt:
                            val = self._clean_value(nxt)
                            if val:
                                return val

        # Fallback: if nothing found, try generic labels but still skip POL/POD lines
        for idx, line in enumerate(lines):
            if re.search(r'port\s+of\s+(loading|discharging)', line, re.IGNORECASE):
                continue
            for label in cargo_labels:
                pattern_same = rf"\b{re.escape(label)}\b\s*[:\-]\s*(.+)"
                m = re.search(pattern_same, line, flags=re.IGNORECASE)
                if m and m.group(1).strip():
                    return self._clean_value(m.group(1))
        return None
    
    def _extract_operation(self, text: str) -> Optional[str]:
        """Extract operation type (load/discharge)."""
        if re.search(r'\b(?:load|loading)\b', text, re.IGNORECASE):
            return 'load'
        if re.search(r'\b(?:discharge|discharging)\b', text, re.IGNORECASE):
            return 'discharge'
        return None
    
    def _extract_demurrage(self, text: str) -> Optional[float]:
        """Extract demurrage rate."""
        match = re.search(r'demurrage[^\d]*([0-9][0-9,\.]*)', text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except ValueError:
                pass
        return None
    
    def _extract_dispatch(self, text: str) -> Optional[float]:
        """Extract dispatch rate."""
        match = re.search(r'(?:dispatch|despatch)[^\d]*([0-9][0-9,\.]*)', text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except ValueError:
                pass
        return None
    
    def _extract_rate(self, text: str) -> Optional[float]:
        """Extract loading/discharge rate scoped to a single line to avoid date leakage."""
        unit_tokens = r'(?:mt\/?day|mt\s*per\s*day|tons\s*per\s*day|t\/day|tpd|per\s*day)'
        # Look per-line to avoid matching a year elsewhere after a distant "loading" word
        for line in text.split('\n'):
            if not re.search(r'\brate\b|'+unit_tokens, line, flags=re.IGNORECASE):
                continue
            # Prefer numbers that are adjacent to units first
            m = re.search(rf'([0-9][0-9,\.]*)\s*{unit_tokens}', line, flags=re.IGNORECASE)
            if not m:
                # Or numbers following the word "rate" on the same line
                m = re.search(r'\brate\b[^\d]*([0-9][0-9,\.]*)', line, flags=re.IGNORECASE)
            if m:
                try:
                    value = float(m.group(1).replace(',', ''))
                    return value
                except ValueError:
                    continue
        return None
    
    def _extract_quantity(self, text: str) -> Optional[float]:
        """Extract cargo quantity."""
        patterns = [
            r'(?:cargo\s*(?:qty|quantity)|quantity|qty)[^\d]*([0-9][0-9,\.]*)',
            r'([0-9][0-9,\.]*)\s*(?:mt|metric\s+tons|tons)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1).replace(',', ''))
                except ValueError:
                    pass
        return None
    
    def _extract_allowed_laytime(self, text: str) -> Optional[float]:
        """Extract allowed laytime."""
        match = re.search(r'(?:allowed\s+laytime|laytime|allowed)[^\d]*([0-9][0-9,\.]*)', text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(',', ''))
            except ValueError:
                pass
        return None

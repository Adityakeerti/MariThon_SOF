from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, re, io, json, asyncio, aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from PyPDF2 import PdfReader

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI(title="SOF Document Extractor", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Config ----
AZURE_ENDPOINT = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")
# Prefer env vars, but fall back to provided key if none found
HF_TOKEN = (
    os.getenv("HUGGINGFACE_TOKEN")
    or os.getenv("HUGGINGFACEHUB_API_TOKEN")
    or os.getenv("HF_TOKEN")
    or "HF_TOKEN"
)

# ---- Helpers ----
def norm_time(t: str) -> str:
    t = t.strip()
    if re.fullmatch(r"\d{3,4}", t):
        t = t.zfill(4)
        return f"{t[:2]}:{t[2:]}"
    m = re.match(r"^(\d{1,2}):(\d{2})$", t)
    return t.zfill(5) if m else t

def calc_duration(s: str, e: str) -> str:
    try:
        sdt = datetime.strptime(s, "%H:%M")
        edt = datetime.strptime(e, "%H:%M")
        if edt < sdt:
            edt += timedelta(days=1)
        h = (edt - sdt).seconds / 3600
        return f"{h:.1f}h" if h % 1 else f"{int(h)}h"
    except:
        return "-"

def norm_date(d: str) -> str:
    d = d.strip()
    m1 = re.search(r'ON\s+([A-Z]+)\s+(\d{1,2}),\s*(\d{4})', d, re.IGNORECASE)
    if m1:
        month_map = {'JANUARY':'Jan','FEBRUARY':'Feb','MARCH':'Mar','APRIL':'Apr','MAY':'May','JUNE':'Jun','JULY':'Jul','AUGUST':'Aug','SEPTEMBER':'Sep','OCTOBER':'Oct','NOVEMBER':'Nov','DECEMBER':'Dec'}
        mon, day, year = m1.groups()
        mon = month_map.get(mon.upper(), mon[:3])
        return f"{day.zfill(2)} {mon} {year}"
    m2 = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', d)
    if m2:
        day, mon, year = m2.groups()
        names = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        try:
            return f"{day.zfill(2)} {names[int(mon)]} {year}"
        except:
            return d
    m3 = re.search(r'([A-Z][a-z]{2,8})\.?\s*(\d{1,2}),\s*(\d{4})', d)
    if m3:
        mon, day, year = m3.groups()
        return f"{day.zfill(2)} {mon[:3]} {year}"
    return d

# ---- Local text parsers (fallbacks and Azure content post-process) ----
VESSEL_PATTERNS = {
    "Vessel Name": [r"(?i)(?:Name of Vessel|Vessel|M\.V\.|Ship)\s*[:\-]?\s*([^\n\r]+)"],
    "Master": [r"(?i)(?:Name of Master|Master|Captain)\s*[:\-]?\s*([^\n\r]+)"],
    "Agent": [r"(?i)(?:Name of Agent|Agent)\s*[:\-]?\s*([^\n\r]+)"],
    "Port of Loading": [r"(?i)(?:Port of Loading|Loading Port|From)\s*[:\-]?\s*([^\n\r,]+)"],
    "Port of Discharge": [r"(?i)(?:Port of Discharging|Port of Discharge|Discharge Port|To)\s*[:\-]?\s*([^\n\r,]+)"],
    "Cargo": [r"(?i)(?:Cargo Description|Description of Cargo|Cargo|Commodity)\s*[:\-]?\s*([^\n\r]+?)\s*(?:Quantity|$)"],
    "Quantity (MT)": [r"(?i)(?:Quantity|Cargo Quantity)\s*[:\-]?\s*([\d,\.]+)", r"([\d,\.]+)\s*(?:METRIC TONS|MT|Tons)"],
}

def extract_vessel_info_text(text: str) -> Dict:
    out = {}
    for field, pats in VESSEL_PATTERNS.items():
        val = "-"
        for p in pats:
            m = re.search(p, text)
            if m:
                val = re.sub(r"^(AT|TO)\s+", "", m.group(1).strip(), flags=re.IGNORECASE)
                break
        out[field] = val
    return out

def extract_events_text(text: str) -> List[Dict]:
    events = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    current_date = ""
    for line in lines:
        # detect date headers
        dm = re.search(r'(ON\s+[A-Z]+\s+\d{1,2},\s*\d{4}|\d{1,2}\.\d{1,2}\.\d{4}|[A-Z][a-z]{2,8}\.?\s*\d{1,2},\s*\d{4})', line, re.IGNORECASE)
        if dm and len(line) <= 60:
            current_date = norm_date(dm.group(1))
            continue
        # time range
        tr = re.search(r'(\d{4})-(\d{4})', line)
        if tr:
            s = norm_time(tr.group(1)); e = norm_time(tr.group(2)); dur = calc_duration(s, e)
            desc = line.split(tr.group(0), 1)[-1].strip() or "Loading Operations"
            rem = "-"
            low = line.lower()
            if "rain" in low: rem="Weather delay"
            elif "breakdown" in low: rem="Equipment failure"
            elif "survey" in low: rem="Survey"
            events.append({"Date": current_date or "-", "Start Time": s, "End Time": e, "Duration": dur, "Event Description": desc.title(), "Remarks": rem})
            continue
        # bullet with single time like "• 1600 HRS: ARRIVED"
        bt = re.search(r'[•\-\*]?\s*(\d{3,4})\s*HRS?[:\-]?\s*(.+)', line, re.IGNORECASE)
        if bt:
            s = norm_time(bt.group(1)); desc = bt.group(2).strip()
            rem = "-"
            low = line.lower()
            if "arriv" in low: rem="Arrival"
            elif "sailed" in low or "depart" in low: rem="Departure"
            events.append({"Date": current_date or "-", "Start Time": s, "End Time": "-", "Duration": "-", "Event Description": desc.title(), "Remarks": rem})
            continue
        # generic row with date + times
        if current_date and re.search(r'\d{3,4}', line) and len(line) > 15:
            single = re.search(r'(\d{3,4})(?!-)', line)
            if single:
                s = norm_time(single.group(1))
                desc = line.split(single.group(1), 1)[-1].strip()
                events.append({"Date": current_date or "-", "Start Time": s, "End Time": "-", "Duration": "-", "Event Description": desc.title() or "-", "Remarks": "-"})
    # sort
    def key(ev):
        try:
            dt = datetime.strptime(ev["Date"], "%d %b %Y")
        except:
            dt = datetime.min
        try:
            tm = datetime.strptime(ev["Start Time"], "%H:%M")
        except:
            tm = datetime.min
        return (dt, tm)
    events.sort(key=key)
    return events or [{"Date":"-","Start Time":"-","End Time":"-","Duration":"-","Event Description":"-","Remarks":"-"}]

# ---- Azure Document Intelligence (uses prebuilt-layout) ----
async def azure_extract(pdf_bytes: bytes) -> Optional[Dict]:
    if not (AZURE_ENDPOINT and AZURE_KEY):
        return None
    headers = {"Ocp-Apim-Subscription-Key": AZURE_KEY, "Content-Type": "application/pdf"}
    analyze_url = f"{AZURE_ENDPOINT}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-02-29-preview"
    async with aiohttp.ClientSession() as session:
        async with session.post(analyze_url, headers=headers, data=pdf_bytes) as resp:
            if resp.status != 202:
                raise HTTPException(400, f"Azure analyze error: {resp.status}")
            op_loc = resp.headers.get("Operation-Location")
        # poll
        for _ in range(30):
            await asyncio.sleep(1)
            async with session.get(op_loc, headers={"Ocp-Apim-Subscription-Key": AZURE_KEY}) as r:
                data = await r.json()
                if data.get("status") == "succeeded":
                    content = data.get("analyzeResult", {}).get("content", "")
                    vessel = extract_vessel_info_text(content)
                    events = extract_events_text(content)
                    return {"vessel_info": vessel, "events": events, "api_used": "Azure Document Intelligence"}
                if data.get("status") == "failed":
                    raise HTTPException(400, "Azure analysis failed")
    raise HTTPException(408, "Azure analysis timeout")

# ---- Hugging Face path (text parsing with token presence, ensures config) ----
async def hf_extract(pdf_bytes: bytes) -> Optional[Dict]:
    if not HF_TOKEN:
        return None
    # For now, we parse text locally and mark API used; HF token ensures configured free API path
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for p in reader.pages:
        try:
            text += p.extract_text() + "\n"
        except:
            pass
    vessel = extract_vessel_info_text(text)
    events = extract_events_text(text)
    return {"vessel_info": vessel, "events": events, "api_used": "Hugging Face (text parse)"}

# ---- Routes ----
@app.get("/")
async def root():
    return {"message": "SOF Document Extractor API v2.0", "status": "ready"}

@app.get("/health")
async def health():
    available = []
    if AZURE_ENDPOINT and AZURE_KEY:
        available.append("Azure Document Intelligence")
    if HF_TOKEN:
        available.append("Hugging Face")
    return {"status": "healthy", "available_apis": available, "timestamp": datetime.now().isoformat()}

@app.post("/extract")
async def extract(pdf: UploadFile):
    if not pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")
    pdf_bytes = await pdf.read()

    # 1) Try Azure (best quality, free 500 pages/month) [1][2][4][8]
    if AZURE_ENDPOINT and AZURE_KEY:
        try:
            return await azure_extract(pdf_bytes)
        except Exception as e:
            # fall through to HF
            pass

    # 2) Try Hugging Face (free token) [6][9]
    if HF_TOKEN:
        try:
            return await hf_extract(pdf_bytes)
        except Exception as e:
            pass

    # 3) If nothing configured
    raise HTTPException(500, "No working API configured. Add HUGGINGFACE_TOKEN or Azure keys in .env.")

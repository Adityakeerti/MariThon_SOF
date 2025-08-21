# Laytime SoF Extractor (Backend)

FastAPI backend to extract structured maritime events from Statement of Facts (SoF) PDFs/DOCs.

## Features
- Docling-based parsing (with PDF/DOCX fallbacks) into ordered lines (page, bbox, line_no)
- Sentence-BERT similarity vs config-driven ontology (`backend/config/events.yml`)
- Robust time extraction (0730, 07.30, 23:50-00:10 rollover)
- Optional interval pairing (COMMENCE/RESUME with STOP/COMPLETE)
- Explainable outputs including source references

## Setup
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

## Run
```bash
uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

## API
- POST `/extract` form-data file field `file`

Example with curl:
```bash
curl -F "file=@sof.pdf" http://localhost:8000/extract
```

## Tests
```bash
pytest -q
```

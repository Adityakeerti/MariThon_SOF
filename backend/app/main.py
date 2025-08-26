from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
from contextlib import asynccontextmanager

from .pipeline_simple import SimpleExtractionPipeline, SimplePipelineConfig
try:
	from .pipeline import ExtractionPipeline, PipelineConfig  # type: ignore
	_HAVE_FULL_PIPELINE = True
except Exception:  # pragma: no cover
	ExtractionPipeline = None  # type: ignore
	PipelineConfig = None  # type: ignore
	_HAVE_FULL_PIPELINE = False
from .auth import router as auth_router

pipeline: Optional[SimpleExtractionPipeline] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
	# Startup
	global pipeline
	if _HAVE_FULL_PIPELINE:
		try:
			pipeline = ExtractionPipeline(PipelineConfig())  # type: ignore[arg-type]
		except Exception:
			pipeline = SimpleExtractionPipeline(SimplePipelineConfig())
	else:
		pipeline = SimpleExtractionPipeline(SimplePipelineConfig())
	yield
	# Shutdown
	pass


app = FastAPI(title="Laytime SoF Extractor", version="0.1.0", lifespan=lifespan)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Include authentication routes
app.include_router(auth_router)


class HealthResponse(BaseModel):
	status: str
	model: Optional[str] = None


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
	return HealthResponse(status="ok", model="Simple Business Data Extractor" if pipeline else None)


@app.post("/extract")
async def extract(
	file: UploadFile = File(...),
	threshold: Optional[float] = Query(None, description="Override confidence threshold"),
	debug: bool = Query(False, description="Return debug info like sample parsed lines"),
	force_ocr: bool = Query(False, description="Force OCR for PDFs (useful for scanned SoF)"),
) -> Any:
	if pipeline is None:
		raise HTTPException(status_code=503, detail="Pipeline not initialized")
	content = await file.read()
	try:
		results = await pipeline.run(
			file.filename,
			content,
			threshold_override=threshold,
			debug=debug,
			force_ocr=force_ocr,
		)
		return results
	except Exception as exc:  # pragma: no cover
		raise HTTPException(status_code=400, detail=str(exc))

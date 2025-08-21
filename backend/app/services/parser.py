from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple
import io
import tempfile
import os

try:
	from docling.document import Document as DLDocument  # type: ignore
	from docling.document import convert_bytes  # hypothetical API; guarded
	docling_available = True
except Exception:  # pragma: no cover
	docling_available = False

try:
	from pdfminer.high_level import extract_pages  # type: ignore
	from pdfminer.layout import LTTextContainer, LTTextLine
except Exception:  # pragma: no cover
	pass

try:
	from docx import Document as DocxDocument  # type: ignore
except Exception:  # pragma: no cover
	DocxDocument = None  # type: ignore

# Optional OCR dependencies
try:  # pragma: no cover - heavy deps, exercised at runtime
	import pypdfium2 as pdfium  # type: ignore
	have_pdfium = True
except Exception:  # pragma: no cover
	have_pdfium = False

try:  # pragma: no cover
	import easyocr  # type: ignore
	have_easyocr = True
except Exception:  # pragma: no cover
	have_easyocr = False

# Optional torch for GPU detection
try:  # pragma: no cover
	import torch  # type: ignore
	have_torch = True
except Exception:  # pragma: no cover
	have_torch = False


@dataclass
class ParsedLine:
	text: str
	page: int
	bbox: Tuple[float, float, float, float]
	line_no: int


class DocParser:
	"""Parses PDF/DOC/DOCX bytes into ordered lines with page, bbox, and line number.

	Prefers Docling if available; falls back to pdfminer/python-docx; as last resort uses OCR.
	"""

	def __init__(self) -> None:
		self._ocr_reader = None
		self.last_mode: str = "unknown"

	def parse(self, filename: str, content: bytes, force_ocr: bool = False) -> List[ParsedLine]:
		lower = (filename or "").lower()
		if lower.endswith(".pdf") and force_ocr:
			lines = self._parse_pdf_ocr(content)
			self.last_mode = "ocr_easyocr" if lines else "ocr_unavailable"
			return lines
		if docling_available:
			try:
				lines = self._parse_with_docling(content)
				if lines:
					self.last_mode = "docling"
					return lines
				raise ValueError("Docling produced zero lines; falling back")
			except Exception:
				pass
		if lower.endswith(".pdf"):
			lines = self._parse_pdfminer(content)
			if not lines:
				ocr_lines = self._parse_pdf_ocr(content)
				if ocr_lines:
					self.last_mode = "ocr_easyocr"
					return ocr_lines
				self.last_mode = "pdfminer_empty"
				return lines
		if lower.endswith(".docx") or lower.endswith(".doc"):
			self.last_mode = "docx"
			return self._parse_docx(content)
		# Unknown type; treat as plaintext
		self.last_mode = "plaintext"
		return [ParsedLine(text=content.decode(errors="ignore"), page=1, bbox=(0, 0, 0, 0), line_no=1)]

	def _parse_with_docling(self, content: bytes) -> List[ParsedLine]:
		lines: List[ParsedLine] = []
		buf = io.BytesIO(content)
		doc = DLDocument(buf)  # type: ignore[arg-type]
		page_index = 0
		for page in getattr(doc, "pages", []):
			page_index += 1
			line_index = 0
			for line in getattr(page, "lines", []):
				line_index += 1
				text = getattr(line, "text", "").strip()
				bbox = getattr(line, "bbox", (0.0, 0.0, 0.0, 0.0))
				if not text:
					continue
				lines.append(ParsedLine(text=text, page=page_index, bbox=tuple(bbox), line_no=line_index))
		return lines

	def _parse_pdfminer(self, content: bytes) -> List[ParsedLine]:
		lines: List[ParsedLine] = []
		page_no = 0
		for page_layout in extract_pages(io.BytesIO(content)):
			page_no += 1
			line_no = 0
			for element in page_layout:
				if isinstance(element, LTTextContainer):
					for text_line in element:
						if isinstance(text_line, LTTextLine):
							text = text_line.get_text().strip()
							if not text:
								continue
							line_no += 1
							bbox = (text_line.x0, text_line.y0, text_line.x1, text_line.y1)
							lines.append(ParsedLine(text=text, page=page_no, bbox=bbox, line_no=line_no))
		return lines

	def _ensure_ocr(self):  # pragma: no cover
		if self._ocr_reader is None and have_easyocr:
			use_gpu = False
			if have_torch:
				try:
					use_gpu = bool(torch.cuda.is_available())
				except Exception:
					use_gpu = False
			self._ocr_reader = easyocr.Reader(["en"], gpu=use_gpu)
		return self._ocr_reader

	def _parse_pdf_ocr(self, content: bytes) -> List[ParsedLine]:  # pragma: no cover
		if not (have_pdfium and have_easyocr):
			return []
		reader = self._ensure_ocr()
		if reader is None:
			return []
		lines: List[ParsedLine] = []
		# Write to temp file for pypdfium2
		with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
			tmp.write(content)
			tmp_path = tmp.name
		try:
			pdf = pdfium.PdfDocument(tmp_path)
			for page_index in range(len(pdf)):
				page = pdf[page_index]
				# Render at higher scale for better OCR
				bitmap = page.render(scale=3.0)  # type: ignore[attr-defined]
				# Prefer PIL then to numpy to ensure RGB
				pil = bitmap.to_pil()  # type: ignore[attr-defined]
				try:
					pil = pil.convert("RGB")
				except Exception:
					pass
				import numpy as np  # local import
				image = np.array(pil)
				# EasyOCR inference; tweak thresholds for low-contrast scans
				results = reader.readtext(image, detail=1, paragraph=False)
				line_no = 0
				for det in results:
					# det: (bbox_points, text, conf)
					try:
						pts, text, conf = det
						if not text or str(text).strip() == "":
							continue
						xs = [p[0] for p in pts]
						ys = [p[1] for p in pts]
						bbox = (float(min(xs)), float(min(ys)), float(max(xs)), float(max(ys)))
						line_no += 1
						lines.append(ParsedLine(text=str(text).strip(), page=page_index + 1, bbox=bbox, line_no=line_no))
					except Exception:
						continue
		except Exception:
			# If pdf cannot be opened/rendered
			return []
		finally:
			try:
				os.unlink(tmp_path)
			except Exception:
				pass
		return lines

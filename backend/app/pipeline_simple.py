from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .services.parser import DocParser, ParsedLine
from .services.business_extractor import BusinessDataExtractor


@dataclass
class SimplePipelineConfig:
	pass


class SimpleExtractionPipeline:
	"""Simplified pipeline that only extracts business data without ML dependencies."""
	
	def __init__(self, config: SimplePipelineConfig) -> None:
		self.config = config
		self.parser = DocParser()

	async def run(
		self,
		filename: str,
		content: bytes,
		threshold_override: Optional[float] = None,
		debug: bool = False,
		force_ocr: bool = False,
	) -> Dict[str, Any]:
		lines = self.parser.parse(filename, content, force_ocr=force_ocr)
		
		# Extract business data
		business_extractor = BusinessDataExtractor()
		business_data = business_extractor.extract([line.text for line in lines])
		
		meta: Dict[str, Any] = {
			"num_lines": len(lines),
			"parser_mode": getattr(self.parser, "last_mode", None),
			"ocr_available": getattr(self.parser, "_ocr_reader", None) is not None,
		}
		if debug:
			meta["sample_lines"] = [
				{"text": l.text, "page": l.page, "line_no": l.line_no} for l in lines[:20]
			]
		
		return {
			"business_data": {
				"vessel": business_data.vessel,
				"voyage_from": business_data.voyage_from,
				"voyage_to": business_data.voyage_to,
				"port": business_data.port,
				"cargo": business_data.cargo,
				"operation": business_data.operation,
				"demurrage": business_data.demurrage,
				"dispatch": business_data.dispatch,
				"rate": business_data.rate,
				"quantity": business_data.quantity,
				"allowed_laytime": business_data.allowed_laytime,
			},
			"meta": meta,
		}

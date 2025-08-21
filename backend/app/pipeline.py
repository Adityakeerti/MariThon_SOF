from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .services.parser import DocParser, ParsedLine
from .services.classify import EventClassifier
from .services.timeparse import TimeExtractor, pair_event_intervals
from .services.business_extractor import BusinessDataExtractor


@dataclass
class PipelineConfig:
	model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
	ontology_path: str = "backend/config/events.yml"
	confidence_threshold: float = 0.45


class ExtractionPipeline:
	def __init__(self, config: PipelineConfig) -> None:
		self.config = config
		self.parser = DocParser()
		self.classifier = EventClassifier(model_name=config.model_name, ontology_path=config.ontology_path)
		self.time_extractor = TimeExtractor()

	async def run(
		self,
		filename: str,
		content: bytes,
		threshold_override: Optional[float] = None,
		debug: bool = False,
		force_ocr: bool = False,
	) -> Dict[str, Any]:
		lines = self.parser.parse(filename, content, force_ocr=force_ocr)
		threshold = threshold_override if threshold_override is not None else self.config.confidence_threshold
		
		# Extract business data first
		business_extractor = BusinessDataExtractor()
		business_data = business_extractor.extract([line.text for line in lines])
		
		# Extract events
		classified: List[Dict[str, Any]] = []
		for line in lines:
			label, confidence, matched_synonym = self.classifier.classify(line.text)
			if label is None or confidence < threshold:
				continue
			timestamps = self.time_extractor.extract(line.text)
			classified.append({
				"event": label,
				"confidence": round(float(confidence), 4),
				"raw_text": line.text,
				"timestamps": [t.isoformat() for t in timestamps],
				"source": {
					"page": line.page,
					"bbox": line.bbox,
					"line_no": line.line_no,
				},
				"matched_synonym": matched_synonym,
			})

		intervals = pair_event_intervals(classified)
		meta: Dict[str, Any] = {
			"model": self.classifier.model_name,
			"threshold": threshold,
			"ontology_size": self.classifier.ontology_size,
			"num_lines": len(lines),
			"num_events": len(classified),
			"parser_mode": getattr(self.parser, "last_mode", None),
			"ocr_available": getattr(self.parser, "_ocr_reader", None) is not None,
		}
		if debug:
			meta["sample_lines"] = [
				{"text": l.text, "page": l.page, "line_no": l.line_no} for l in lines[:20]
			]
		
		return {
			"events": classified,
			"intervals": intervals,
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

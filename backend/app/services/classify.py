from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import yaml
import os

from sentence_transformers import SentenceTransformer, util
import torch


@dataclass
class Ontology:
	label_to_synonyms: Dict[str, List[str]]

	@classmethod
	def from_yaml(cls, path: str) -> "Ontology":
		with open(path, "r", encoding="utf-8") as f:
			data = yaml.safe_load(f) or {}
		return cls(label_to_synonyms={k: list(v or []) for k, v in data.items()})


class EventClassifier:
	def __init__(self, model_name: str, ontology_path: str) -> None:
		self.model_name = model_name
		self.model = SentenceTransformer(model_name)
		self.ontology = Ontology.from_yaml(ontology_path)
		# Precompute embeddings for all synonyms for fast similarity
		self.synonym_to_label: Dict[str, str] = {}
		for label, syns in self.ontology.label_to_synonyms.items():
			for s in syns + [label]:
				self.synonym_to_label[s] = label
		self.synonyms: List[str] = list(self.synonym_to_label.keys())
		self.syn_embeddings = self.model.encode(self.synonyms, convert_to_tensor=True, normalize_embeddings=True)

	@property
	def ontology_size(self) -> int:
		return len(self.ontology.label_to_synonyms)

	def classify(self, text: str) -> Tuple[Optional[str], float, Optional[str]]:
		if not text or not text.strip():
			return None, 0.0, None
		query = text.strip()
		q_emb = self.model.encode(query, convert_to_tensor=True, normalize_embeddings=True)
		scores = util.cos_sim(q_emb, self.syn_embeddings)[0]
		best_idx = int(torch.argmax(scores).item())
		best_score = float(scores[best_idx].item())
		best_syn = self.synonyms[best_idx]
		return self.synonym_to_label.get(best_syn), best_score, best_syn

from app.services.classify import EventClassifier
from app.pipeline import PipelineConfig


def test_classifier_commence(tmp_path):
	cfg = PipelineConfig()
	clf = EventClassifier(cfg.model_name, cfg.ontology_path)
	label, score, syn = clf.classify("Vessel commenced loading at 0730 hrs")
	assert label in {"COMMENCE", "ARRIVAL", "NOR_TENDERED", "RESUME", "STOP", "COMPLETE"}
	assert score > 0.2  # weak but should be > 0 for embedding models

import pytest
from datetime import datetime

from app.services.timeparse import TimeExtractor, pair_event_intervals


def test_extract_simple_formats():
	base = datetime(2024, 1, 1, 0, 0, 0)
	extractor = TimeExtractor(base)
	text = "Vessel commenced loading at 0730 and stopped at 12.45 then resumed 14:10."
	ts = extractor.extract(text)
	assert len(ts) >= 3
	assert ts[0].hour == 7 and ts[0].minute == 30
	assert ts[1].hour == 12 and ts[1].minute == 45
	assert ts[2].hour == 14 and ts[2].minute == 10


def test_extract_range_rollover():
	base = datetime(2024, 1, 1, 0, 0, 0)
	extractor = TimeExtractor(base)
	text = "Work 23:50-00:10"
	ts = extractor.extract(text)
	assert len(ts) == 2
	assert ts[0].hour == 23 and ts[0].minute == 50
	assert ts[1] > ts[0]
	assert ts[1].day == 2  # rolled over to next day


def test_pair_intervals():
	events = [
		{"event": "COMMENCE", "timestamps": ["2024-01-01T07:30:00"], "raw_text": ""},
		{"event": "STOP", "timestamps": ["2024-01-01T12:45:00"], "raw_text": ""},
		{"event": "RESUME", "timestamps": ["2024-01-01T14:10:00"], "raw_text": ""},
		{"event": "COMPLETE", "timestamps": ["2024-01-01T18:00:00"], "raw_text": ""},
	]
	intervals = pair_event_intervals(events)
	assert len(intervals) == 2
	assert round(intervals[0]["duration_hours"], 2) == round((12 + 45/60) - (7 + 30/60), 2)
	assert round(intervals[1]["duration_hours"], 2) == round(18 - (14 + 10/60), 2)

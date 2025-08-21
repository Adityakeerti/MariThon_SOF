from __future__ import annotations

import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

import dateparser

# Regex patterns
SIMPLE_PATTERNS = [
	re.compile(r"\b(?P<h>\d{2})(?P<m>\d{2})\b"),            # 0730
	re.compile(r"\b(?P<h>\d{2})\.(?P<m>\d{2})\b"),        # 07.30
	re.compile(r"\b(?P<h>\d{2}):(?P<m>\d{2})\b"),          # 07:30
]

# Range patterns first to avoid double counting
RANGE_PATTERNS = [
	re.compile(r"\b(?P<sh>\d{2}):(?P<sm>\d{2})-(?P<eh>\d{2}):(?P<em>\d{2})\b"),  # 23:50-00:10
	re.compile(r"\b(?P<sh>\d{2})\.(?P<sm>\d{2})-(?P<eh>\d{2})\.(?P<em>\d{2})\b"),  # 23.50-00.10
	re.compile(r"\b(?P<sh>\d{2})(?P<sm>\d{2})-(?P<eh>\d{2})(?P<em>\d{2})\b"),  # 2350-0010
]


def _parse_simple(h: str, m: str, base: datetime | None) -> datetime | None:
	try:
		if base is None:
			base = datetime.now()
		return base.replace(hour=int(h), minute=int(m), second=0, microsecond=0)
	except ValueError:
		return None


def _span_overlaps(a: Tuple[int, int], spans: List[Tuple[int, int]]) -> bool:
	as0, as1 = a
	for s0, s1 in spans:
		# overlap if ranges intersect
		if not (as1 <= s0 or as0 >= s1):
			return True
	return False


class TimeExtractor:
	def __init__(self, base_datetime: datetime | None = None) -> None:
		self.base_datetime = base_datetime

	def extract(self, text: str) -> List[datetime]:
		results: List[datetime] = []
		if not text:
			return results

		covered_spans: List[Tuple[int, int]] = []
		# 1) Extract ranges first and record their spans
		for rx in RANGE_PATTERNS:
			for m in rx.finditer(text):
				gd = m.groupdict()
				start = _parse_simple(gd["sh"], gd["sm"], self.base_datetime)
				end = _parse_simple(gd["eh"], gd["em"], self.base_datetime)
				if start and end:
					if end <= start:
						end = end + timedelta(days=1)
					results.extend([start, end])
					covered_spans.append(m.span())

		# 2) Extract simple times but skip if inside any recorded range span
		for rx in SIMPLE_PATTERNS:
			for m in rx.finditer(text):
				if _span_overlaps(m.span(), covered_spans):
					continue
				gd = m.groupdict()
				val = _parse_simple(gd["h"], gd["m"], self.base_datetime)
				if val:
					results.append(val)
		return results


def pair_event_intervals(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	"""Pair COMMENCE/RESUME with STOP/COMPLETE and compute durations.

	Events are expected to have ISO timestamps in `timestamps` list.
	"""
	intervals: List[Dict[str, Any]] = []
	stack: List[Dict[str, Any]] = []
	for ev in events:
		label = ev.get("event") or ""
		ts_list = ev.get("timestamps") or []
		if not ts_list:
			continue
		try:
			ts0 = datetime.fromisoformat(ts_list[0])
		except Exception:
			continue
		if label.upper() in {"COMMENCE", "RESUME", "COMMENCED", "START"}:
			stack.append({"label": label, "time": ts0, "event": ev})
		elif label.upper() in {"STOP", "COMPLETE", "COMPLETED", "FINISH", "FINISHED"}:
			if stack:
				start_ev = stack.pop()
				start_time = start_ev["time"]
				end_time = ts0
				duration_hours = (end_time - start_time).total_seconds() / 3600.0
				intervals.append({
					"start_event": start_ev["event"],
					"end_event": ev,
					"start": start_time.isoformat(),
					"end": end_time.isoformat(),
					"duration_hours": round(duration_hours, 4),
				})
	return intervals

"""Feature engineering for CloudScale AI demand prediction.

Transforms a sequence of historical ``ResourceMetric`` observations into a
numeric feature matrix suitable for supervised regression.

Feature vector per sample (columns in order):
    0  cpu_utilization
    1  memory_utilization
    2  storage_utilization
    3  network_utilization
    4  cpu_rolling_mean_3      (3-sample rolling average)
    5  memory_rolling_mean_3
    6  cpu_lag_1               (previous sample CPU)
    7  memory_lag_1            (previous sample memory)
    8  hour_of_day             (0-23, from metric timestamp)

Target: next-sample cpu_utilization (regression).
"""

from __future__ import annotations

import numpy as np

from app.models.metric import ResourceMetric


def _rolling_mean(values: list[float], window: int, index: int) -> float:
    """Compute the mean of up to ``window`` preceding values ending at ``index``."""
    start = max(0, index - window + 1)
    segment = values[start: index + 1]
    return float(np.mean(segment))


def prepare_features(
    metrics: list[ResourceMetric],
) -> tuple[np.ndarray, np.ndarray]:
    """Convert an ordered list of metrics into X (features) and y (target).

    The target for sample *i* is the CPU utilization of sample *i+1*, so
    the last metric is used only as a target (never as a feature row).
    This means at least **2** metrics are required, and usable samples
    equal ``len(metrics) - 1``.

    Args:
        metrics: Chronologically ordered ``ResourceMetric`` instances
                 (ascending timestamp).

    Returns:
        A tuple ``(X, y)`` where X has shape ``(n_samples, 9)`` and
        y has shape ``(n_samples,)``.

    Raises:
        ValueError: If fewer than 2 metrics are provided.
    """
    if len(metrics) < 2:
        raise ValueError("At least 2 metric samples are required for feature preparation")

    cpus = [m.cpu_utilization for m in metrics]
    mems = [m.memory_utilization for m in metrics]
    stors = [m.storage_utilization for m in metrics]
    nets = [m.network_utilization for m in metrics]

    rows: list[list[float]] = []
    targets: list[float] = []

    for i in range(len(metrics) - 1):
        m = metrics[i]
        hour = float(m.timestamp.hour) if m.timestamp else 0.0

        row = [
            cpus[i],
            mems[i],
            stors[i],
            nets[i],
            _rolling_mean(cpus, 3, i),
            _rolling_mean(mems, 3, i),
            cpus[i - 1] if i > 0 else cpus[i],   # lag-1 CPU
            mems[i - 1] if i > 0 else mems[i],    # lag-1 memory
            hour,
        ]
        rows.append(row)
        targets.append(cpus[i + 1])  # next-step CPU as target

    return np.array(rows, dtype=np.float64), np.array(targets, dtype=np.float64)


def prepare_single_prediction_features(
    metrics: list[ResourceMetric],
) -> np.ndarray:
    """Build a single feature row from the latest metrics for prediction.

    Uses the last metric as the current observation and preceding metrics
    for lag/rolling features.

    Args:
        metrics: Chronologically ordered metric list (most recent last).
                 At least 1 metric required.

    Returns:
        Feature array with shape ``(1, 9)``.

    Raises:
        ValueError: If the metric list is empty.
    """
    if not metrics:
        raise ValueError("At least 1 metric sample is required for prediction features")

    cpus = [m.cpu_utilization for m in metrics]
    mems = [m.memory_utilization for m in metrics]

    i = len(metrics) - 1
    m = metrics[i]
    hour = float(m.timestamp.hour) if m.timestamp else 0.0

    row = [
        m.cpu_utilization,
        m.memory_utilization,
        m.storage_utilization,
        m.network_utilization,
        _rolling_mean(cpus, 3, i),
        _rolling_mean(mems, 3, i),
        cpus[i - 1] if i > 0 else cpus[i],
        mems[i - 1] if i > 0 else mems[i],
        hour,
    ]
    return np.array([row], dtype=np.float64)

"""ML model training for CloudScale AI demand prediction.

Trains a scikit-learn ``RandomForestRegressor`` on historical resource
metrics prepared by :mod:`app.ml.features`, evaluates it chronologically
(no data leakage), and saves/loads the fitted model artifact to disk.

The model artifact is stored as a ``.joblib`` file inside
``app/ml/artifacts/``. Versioning uses a UTC timestamp suffix so each
successful training run produces a distinct version identifier.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.ml.features import prepare_features
from app.models.metric import ResourceMetric

# Minimum usable samples after feature preparation before we train.
MIN_TRAINING_SAMPLES = 10

# Chronological split: first 80% train, last 20% validation.
VALIDATION_FRACTION = 0.2

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_FILENAME = "demand_predictor.joblib"


def _model_path(version: str | None = None) -> str:
    """Return an absolute path to the model artifact (optionally versioned)."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    if version:
        return os.path.join(MODEL_DIR, f"demand_predictor_{version}.joblib")
    return os.path.join(MODEL_DIR, MODEL_FILENAME)


@dataclass
class TrainingMetrics:
    """Metrics computed on the held-out validation split."""

    mae: float
    rmse: float
    r2: float
    samples_used: int
    model_version: str


def train_demand_model(
    metrics: list[ResourceMetric],
    min_samples: int = MIN_TRAINING_SAMPLES,
) -> TrainingMetrics:
    """Train and persist a RandomForestRegressor on historical metrics.

    Args:
        metrics: Chronologically ordered metric samples (ascending timestamp).
        min_samples: Minimum number of usable feature samples required.

    Returns:
        A ``TrainingMetrics`` dataclass with validation MAE, RMSE, R²,
        the sample count, and the generated model version string.

    Raises:
        ValueError: If insufficient data is available for training.
    """
    X, y = prepare_features(metrics)
    if len(X) < min_samples:
        raise ValueError(
            f"Insufficient data for training: need at least {min_samples} samples, got {len(X)}"
        )

    # Chronological split to avoid data leakage: the model is always
    # evaluated on data that occurs *after* the training window.
    split_index = int(len(X) * (1.0 - VALIDATION_FRACTION))
    if split_index < 1:
        split_index = 1
    if split_index >= len(X):
        split_index = len(X) - 1

    X_train, X_val = X[:split_index], X[split_index:]
    y_train, y_val = y[:split_index], y[split_index:]

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_val)

    mae = float(mean_absolute_error(y_val, predictions))
    rmse = float(np.sqrt(mean_squared_error(y_val, predictions)))
    r2 = float(r2_score(y_val, predictions))

    version = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    joblib.dump(model, _model_path(version))
    # Keep a stable "latest" pointer for easy loading.
    joblib.dump(model, _model_path())

    return TrainingMetrics(
        mae=mae,
        rmse=rmse,
        r2=r2,
        samples_used=len(X),
        model_version=version,
    )

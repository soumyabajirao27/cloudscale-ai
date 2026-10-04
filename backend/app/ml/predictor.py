"""ML prediction service for CloudScale AI demand prediction.

Loads a trained ``RandomForestRegressor`` artifact, prepares input features
from the latest historical metrics, and returns a structured numeric
prediction of future CPU utilization.

If no trained model artifact exists, the service raises ``ModelNotAvailable``
so callers can transparently fall back to the baseline rule engine.
"""

from __future__ import annotations

import os

import joblib
import numpy as np

from app.ml.features import prepare_single_prediction_features
from app.ml.trainer import MODEL_FILENAME, MODEL_DIR
from app.models.metric import ResourceMetric


class ModelNotAvailableError(Exception):
    """Raised when a trained model artifact is missing or cannot be loaded."""


class PredictionService:
    """Service that loads a trained model and produces numeric predictions."""

    def __init__(self, model_path: str | None = None) -> None:
        self.model_path = model_path or os.path.join(MODEL_DIR, MODEL_FILENAME)
        self._model = None

    def _load_model(self):
        """Lazily load the trained model artifact from disk."""
        if self._model is not None:
            return self._model
        if not os.path.exists(self.model_path):
            raise ModelNotAvailableError("Trained model artifact not found")
        try:
            self._model = joblib.load(self.model_path)
        except Exception as exc:  # pragma: no cover - defensive
            raise ModelNotAvailableError(f"Failed to load model artifact: {exc}")
        return self._model

    def predict_cpu_utilization(self, metrics: list[ResourceMetric]) -> float:
        """Return a numeric prediction of future CPU utilization percentage.

        Args:
            metrics: Chronologically ordered metric samples (most recent last).

        Returns:
            Predicted CPU utilization percentage (float).

        Raises:
            ModelNotAvailableError: If the model artifact is missing/unloadable.
            ValueError: If no metrics are provided for feature preparation.
        """
        model = self._load_model()
        features = prepare_single_prediction_features(metrics)
        prediction = model.predict(features)
        # Clamp to a valid utilization percentage range.
        return float(np.clip(prediction[0], 0.0, 100.0))

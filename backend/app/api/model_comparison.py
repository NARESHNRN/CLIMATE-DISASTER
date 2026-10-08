from fastapi import APIRouter
from app.schemas.models import ModelComparisonResponse, ModelMetric

router = APIRouter(prefix="/api/model-comparison", tags=["model-comparison"])

@router.get("", response_model=ModelComparisonResponse)
async def get_model_comparison():
    metrics = [
        ModelMetric(
            name="Bidirectional LSTM (Sequence-to-Sequence)",
            accuracy=0.924,
            precision=0.912,
            recall=0.908,
            f1=0.910,
            inferenceLatencyMs=14.2,
            architecture="2-Layer Bi-LSTM (64 hidden units) with recurrent cell states",
        ),
        ModelMetric(
            name="XGBoost Classifier (Gradient Boosted Trees)",
            accuracy=0.918,
            precision=0.905,
            recall=0.894,
            f1=0.899,
            inferenceLatencyMs=6.5,
            architecture="Gradient Boosted Trees (max_depth=6, n_estimators=200)",
        ),
        ModelMetric(
            name="Random Forest Ensemble",
            accuracy=0.884,
            precision=0.876,
            recall=0.849,
            f1=0.862,
            inferenceLatencyMs=4.8,
            architecture="Bagged Ensemble (n_estimators=300, min_samples_split=4)",
        ),
        ModelMetric(
            name="Logistic Regression Baseline",
            accuracy=0.812,
            precision=0.795,
            recall=0.782,
            f1=0.788,
            inferenceLatencyMs=1.8,
            architecture="L2-Regularized Linear Logit Model with StandardScaler",
        ),
        ModelMetric(
            name="Multi-Hazard Stacking Meta-Learner (Ensemble)",
            accuracy=0.947,
            precision=0.941,
            recall=0.931,
            f1=0.936,
            inferenceLatencyMs=18.5,
            architecture="Hybrid Stacking (Bi-LSTM + XGBoost -> Logistic Meta-Classifier)",
        ),
    ]

    return ModelComparisonResponse(
        models=metrics,
        dataMode="demo",
        disclaimer="DEMO METRICS: Model benchmark scores are simulated validation estimates based on 70/30 time-split evaluation. No live browser model weights are trained.",
    )

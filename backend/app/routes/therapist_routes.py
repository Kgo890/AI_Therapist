from fastapi import APIRouter
from backend.app.model.conversation_model import (
    predict_emotion,
    get_prediction_generate_response,
    load_emotion_model
)

from backend.app.schemas.conversation_schemas import (
    EmotionPredictionRequest,
    EmotionPredictionResponse,
    EmotionRequest,
    TherapistResponse
)

therapist_router = APIRouter(prefix="/therapist", tags=["Therapist"])

tokenizer, model = load_emotion_model()


@therapist_router.post("/predict-emotion", response_model=EmotionPredictionResponse)
def predicting_emotion(user: EmotionPredictionRequest):
    final_prediction, top_3 = predict_emotion(user.user_response, tokenizer, model)
    return {
        "Final_prediction": final_prediction,
        "Top_3_predictions": top_3
    }


@therapist_router.post("/generate_response", response_model=TherapistResponse)
def generating_therapist_response(user: EmotionRequest):
    response = get_prediction_generate_response(user.final_prediction, user.user_response)
    return {"therapist_response": response}
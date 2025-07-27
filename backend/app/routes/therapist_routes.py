from fastapi import APIRouter
from backend.app.model.conversation_model import (
    predict_emotion,
    generate_therapist_reply

)

from backend.app.schemas.conversation_schemas import (
    EmotionPredictionRequest,
    EmotionPredictionResponse,
    EmotionRequest,
    TherapistResponse
)

therapist_router = APIRouter(prefix="/therapist", tags=["Therapist"])


@therapist_router.post("/predict-emotion", response_model=EmotionPredictionResponse)
def predicting_emotion(user: EmotionPredictionRequest):
    print(predict_emotion(user.user_response))  # See if it prints a tuple
    final_prediction = predict_emotion(user.user_response)
    return {
        "Final_prediction": final_prediction
    }


@therapist_router.post("/generate_response", response_model=TherapistResponse)
def generating_therapist_response(user: EmotionRequest):
    response = generate_therapist_reply(user.user_response)
    return {"therapist_response": response}
from fastapi import APIRouter

from backend.app.db.mongo import conversation_collection
from backend.app.model.conversation_model import predict_emotion, get_prediction_generate_response, load_emotion_model
from backend.app.schemas.conversation_schemas import ConversationEntry, EmotionRequest

therapist_router = APIRouter(prefix="/therapist", tags=["Therapist"])

tokenizer, model = load_emotion_model("emotion_model_tf")


@therapist_router.post("/predict-emotion")
def predicting_emotion(user: ConversationEntry):
    final_prediction, top_3 = predict_emotion(user.user_response, tokenizer, model)
    return {
        "Final prediction": final_prediction,
        "Top 3 predictions": top_3
    }


@therapist_router.post("/generate_response")
def generating_therapist_response(user: EmotionRequest):
    response = get_prediction_generate_response(user.final_prediction, user.user_response)
    return {"therapist_response": response}

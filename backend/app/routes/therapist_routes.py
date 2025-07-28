from fastapi import APIRouter, HTTPException
from backend.app.db.mongo import conversation_collection
from backend.app.model.conversation_model import (
    predict_emotion,
    generate_therapist_reply
)
from backend.app.schemas.conversation_schemas import (
    EmotionPredictionRequest,
    EmotionPredictionResponse,
    EmotionRequest,
    TherapistResponse,
    SaveConversationRequest,
    SavedConversationResponse,
    ConversationItem
)

therapist_router = APIRouter(prefix="/therapist", tags=["Therapist"])


@therapist_router.post("/predict-emotion", response_model=EmotionPredictionResponse)
def predicting_emotion(user: EmotionPredictionRequest):
    try:
        final_prediction, top_3 = predict_emotion(user.user_response)
        return {
            "Final_prediction": final_prediction,
            "Top_3_predictions": top_3
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@therapist_router.post("/generate-response", response_model=TherapistResponse)
def generating_therapist_response(user: EmotionRequest):
    print(f"[DEBUG] user_response: {user.user_response}")
    print(f"[DEBUG] final_prediction: {user.final_prediction}")
    print(f"[DEBUG] user_id: {user.user_id}")

    try:
        response = generate_therapist_reply(
            user_input=user.user_response,
            predicted_emotion=user.final_prediction,
            user_id=user.user_id
        )
        return {
            "therapist_response": response,
        }
    except Exception as e:
        print(f"[ERROR] generate_therapist_reply failed: {e}")
        raise


@therapist_router.post("/save-history")
async def save_conversation_history(data: SaveConversationRequest):
    try:
        new_user_entry = {
            "role": "user",
            "text": data.user_message,
            "emotion": data.emotion
        }

        therapist_reply = {
            "role": "therapist",
            "text": data.therapist_reply,
            "emotion": "neutral"
        }

        # Upsert with slice to maintain only latest 3 messages
        conversation_collection.update_one(
            {"user_id": data.user_id},
            {
                "$push": {
                    "conversation": {
                        "$each": [new_user_entry, therapist_reply],
                        "$slice": -6  # 3 exchanges = 6 messages
                    }
                }
            },
            upsert=True
        )

        return {"message": "Conversation saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@therapist_router.get("/get-history/{user_id}", response_model=SavedConversationResponse)
async def get_conversation_history(user_id: str):
    try:
        doc = conversation_collection.find_one({"user_id": user_id})
        if not doc:
            raise HTTPException(status_code=404, detail="No history found for this user")

        conversation_items = [ConversationItem(**entry) for entry in doc.get("conversation", [])]
        return {
            "user_id": user_id,
            "conversation": conversation_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

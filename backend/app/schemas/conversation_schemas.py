from pydantic import BaseModel
from typing import List, Tuple


class EmotionPredictionRequest(BaseModel):
    user_response: str


class EmotionPredictionResponse(BaseModel):
    Final_prediction: str
    Top_3_predictions: List[Tuple[str, float]]


class EmotionRequest(BaseModel):
    user_id: str
    final_prediction: str
    user_response: str


class TherapistResponse(BaseModel):
    therapist_response: str


class ConversationItem(BaseModel):
    role: str
    text: str
    emotion: str | None = None


class SaveConversationRequest(BaseModel):
    user_id: str
    user_message: str
    therapist_reply: str
    emotion: str


class SavedConversationResponse(BaseModel):
    user_id: str
    conversation: List[ConversationItem]

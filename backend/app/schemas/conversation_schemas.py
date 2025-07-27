from pydantic import BaseModel
from typing import List, Tuple


class EmotionPredictionRequest(BaseModel):
    user_response: str


class EmotionPredictionResponse(BaseModel):
    Final_prediction: str
    Top_3_predictions: List[Tuple[str, float]]


class EmotionRequest(BaseModel):
    final_prediction: str
    user_response: str


class TherapistResponse(BaseModel):
    therapist_response: str


class ConversationEntry(BaseModel):
    user_response: str
    ai_therapist_response: str


class SaveConversation(BaseModel):
    conversation: List[ConversationEntry]

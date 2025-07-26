from pydantic import BaseModel
from typing import List


class ConversationEntry(BaseModel):
    user_response: str
    ai_therapist_response: str


class SaveConversation(BaseModel):
    conversation: List[ConversationEntry]


class EmotionRequest(BaseModel):
    final_prediction: str
    user_response: str

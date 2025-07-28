from pymongo import DESCENDING
from backend.app.db.mongo import conversation_collection
import re

# === Temporarily disable Hugging Face model loading ===
# from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
# import torch
# from functools import lru_cache

# emotion_model_path = "Kgo890/roberta-emotion-model"
# emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model_path)
# emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model_path)
# emotion_model.eval()

# === TEMPORARY: return dummy emotion and confidence ===
def predict_emotion(text):
    return "neutral", [("neutral", 1.0)]


# === TEMPORARY: fake text generation model ===
def get_generator():
    return lambda prompt, **kwargs: [{"generated_text": "Therapist: I'm here to support you. 😊"}]

def generate_response(prompt: str):
    generator = get_generator()
    result = generator(prompt, max_new_tokens=256)
    return result[0]["generated_text"]


def fetch_conversation_history(user_id):
    last_convos = conversation_collection.find(
        {"user_id": user_id},
        {"_id": 0, "conversation": 1}
    ).sort("timestamp", DESCENDING).limit(3)

    history = []
    for convo in reversed(list(last_convos)):
        for message in convo['conversation']:
            role = message['role']
            text = message['text']
            if role == "user":
                emotion = message.get('emotion')
                if emotion:
                    history.append(f"<emotion={emotion}> User: {text}")
                else:
                    history.append(f"User: {text}")
            elif role == "therapist":
                history.append(f"Therapist: {text}")
    return "\n".join(history)


def generate_therapist_reply(user_input, predicted_emotion, user_id):
    history_block = fetch_conversation_history(user_id)
    new_turn = f"<emotion={predicted_emotion}> User: {user_input}"
    prompt = f"{history_block}\n{new_turn}\nTherapist:"

    generator = get_generator()
    response = generator(
        prompt,
        max_length=60,
        do_sample=True,
        top_k=40,
        top_p=0.95,
        temperature=0.8,
        repetition_penalty=1.2
    )[0]['generated_text']

    if "Therapist:" in response:
        generated_reply = response.split("Therapist:")[-1]
    else:
        generated_reply = response.strip()

    generated_reply = generated_reply.split("User:")[0]

    cleaned_reply = (
        generated_reply.replace("\\n", " ")
        .replace("\n", " ")
        .replace("\r", " ")
        .replace("  ", " ")
        .strip()
    )

    first_sentence = re.split(r'(?<=[.!?]) +', cleaned_reply)[0]
    return first_sentence.strip()

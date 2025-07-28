from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from pymongo import DESCENDING
from backend.app.db.mongo import conversation_collection
from functools import lru_cache
import torch
import re
import os

emotion_model_path = "Kgo890/roberta-emotion-model"

emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model_path)
emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model_path)
emotion_model.eval()


@lru_cache()
def get_generator():
    return pipeline(
        "text-generation",
        model="Kgo890/therapist-gpt-distilgpt2-emotion",
        tokenizer="distilgpt2",
    )


def generate_response(prompt: str):
    generator = get_generator()
    result = generator(prompt, max_new_tokens=256)
    return result[0]["generated_text"]


def predict_emotion(text):
    inputs = emotion_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = emotion_model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)

    predicted_class = torch.argmax(probs, dim=1).item()
    emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']

    top3_indices = torch.topk(probs, 3).indices[0].tolist()
    top3_probs = torch.topk(probs, 3).values[0].tolist()
    top3 = [(emotion_labels[i], round(top3_probs[idx], 4)) for idx, i in enumerate(top3_indices)]

    return emotion_labels[predicted_class], top3


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

from transformers import (
    GPT2LMHeadModel,
    GPT2Tokenizer,
    AutoTokenizer,
    AutoModelForSequenceClassification
)
import torch
import torch.nn.functional as F
from typing import Tuple, List


labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]


def load_emotion_model(model_path="./roberta-emotion-pytorch"):
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    return tokenizer, model


def load_conversation_model(model_path="./therapist-gpt-distilgpt2"):
    tokenizer = GPT2Tokenizer.from_pretrained(model_path)
    model = GPT2LMHeadModel.from_pretrained(model_path)
    return tokenizer, model


def predict_emotion(user_input: str, tokenizer, model) -> Tuple[str, List[Tuple[str, float]]]:
    inputs = tokenizer(user_input, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    probs = F.softmax(logits, dim=-1).squeeze()
    top_pred_id = torch.argmax(probs).item()

    top_label = labels[top_pred_id]
    top_predictions = [(labels[i], float(probs[i])) for i in torch.topk(probs, 3).indices.tolist()]
    return top_label, top_predictions


def generate_therapist_response(emotion: str, user_input: str, model, tokenizer) -> str:
    prompt = f"User (feeling {emotion}): {user_input}\nTherapist:"
    input_ids = tokenizer.encode(prompt, return_tensors="pt")

    output_ids = model.generate(
        input_ids=input_ids,
        max_length=150,
        num_return_sequences=1,
        no_repeat_ngram_size=2,
        pad_token_id=tokenizer.eos_token_id,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.9
    )

    output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    response = output_text.split("Therapist:")[-1].strip()
    return response


def get_prediction_generate_response(emotion: str, user_input: str) -> str:
    gpt_tokenizer, gpt_model = load_conversation_model()
    return generate_therapist_response(emotion, user_input, gpt_model, gpt_tokenizer)

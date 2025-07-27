from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import os
import torch


base_dir = os.path.dirname(os.path.abspath(__file__))
emotion_model_path = os.path.join(base_dir, "..", "..", "roberta-emotion-model")

print("Using Roberta model path:", emotion_model_path)
print("Exists:", os.path.exists(emotion_model_path))


emotion_tokenizer = AutoTokenizer.from_pretrained(emotion_model_path)
emotion_model = AutoModelForSequenceClassification.from_pretrained(emotion_model_path)
emotion_model.eval()

generator = pipeline(
    "text-generation",
    model=os.path.join(base_dir, "..", "..", "therapist-gpt-distilgpt2-emotion"),
    tokenizer="distilgpt2"
)

conversation_history = []


def predict_emotion(text):
    inputs = emotion_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = emotion_model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()
    emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
    return emotion_labels[predicted_class]


def generate_therapist_reply(user_input):
    emotion = predict_emotion(user_input)

    user_tagged = f"<emotion={emotion}> User: {user_input}"
    conversation_history.append(user_tagged)

    history_block = "\n".join(conversation_history[-6:])
    prompt = f"{history_block}\nTherapist:"

    response = generator(prompt, max_length=150, do_sample=True, top_k=50)[0]['generated_text']

    if "Therapist:" in response:
        generated_reply = response.split("Therapist:")[-1].strip()
    else:
        generated_reply = response.strip()

    conversation_history.append(generated_reply)

    return generated_reply

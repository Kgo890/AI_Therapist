from transformers import AutoTokenizer, TFAutoModelForSequenceClassification
import tensorflow as tf


def load_emotion_model(model_dir="emotion_model_tf"):
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = TFAutoModelForSequenceClassification.from_pretrained(model_dir)
    return model, tokenizer


def predict_emotion(text, tokenizer, model):
    top_3 = []
    inputs = tokenizer(text, return_tensors='tf', truncation=True, padding=True)
    outputs = model(inputs)
    logits = outputs.logits
    probabilities = tf.nn.softmax(logits, axis=1)

    top_3_scores = tf.argsort(probabilities, direction="DESCENDING")[0][:3]

    for index in top_3_scores:
        index = index.numpy().item()
        score = probabilities[0][index]
        score = round(score, 4)
        label = model.config.label_names[index]
        top_3.append({"label": label, "confidence": score})

    return top_3[0], top_3


def get_prediction_generate_response(top_prediction: str, user_response: str) -> str:
    pass

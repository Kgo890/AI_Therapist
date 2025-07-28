import React, { useState, useEffect, useRef } from 'react';
import api from "../utils/axios";
import { jwtDecode } from "jwt-decode";

let userId = null;
const token = localStorage.getItem("access_token");
if (token) {
  try {
    const decoded = jwtDecode(token);
    userId = decoded.sub || decoded.user_id || decoded.id;
  } catch (err) {
    console.error("Invalid token:", err);
  }
}

export default function MicInput({ onResponse }) {
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
        setInput(transcript);
        setListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
        if (event.error === "no-speech") {
          alert("No speech detected. Please speak louder or closer to your microphone.");
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onspeechend = () => {
        recognitionRef.current.stop();
        setListening(false);
      };
    }
  }, []);

  const handleMicClick = () => {
    if (recognitionRef.current && !listening) {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSubmit = async (e) => {
  e?.preventDefault();
  if (!input.trim() || isSubmitting) return;
  setIsSubmitting(true);

  try {
    const emotionRes = await api.post("/therapist/predict-emotion", {
      user_response: input,
    });

    const predictedEmotion = emotionRes.data.Final_prediction;

    const replyRes = await api.post('/therapist/generate-response', {
      final_prediction: predictedEmotion,
      user_response: input,
      user_id: userId,
    });

    onResponse({
      userText: input,
      emotion: predictedEmotion,
      therapistText: replyRes.data.therapist_response,
    });

    setInput('');
  } catch (error) {
    console.error("Error generating response:", error);
    alert("There was a problem generating the therapist's response.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>AI Therapist</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Let's talk..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />
        <div style={styles.controls}>
          <button type="submit" style={styles.enterBtn} disabled={isSubmitting}>
            {isSubmitting ? "Loading..." : "Enter"}
          </button>
          <span onClick={handleMicClick} style={styles.mic}>🎤</span>
        </div>
      </form>
      {listening && <p style={styles.listening}>Listening...</p>}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#003b5b",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
    color: "#fff",
    marginBottom: "20px",
  },
  title: {
    marginBottom: "15px",
    fontSize: "24px",
    fontWeight: "bold"
  },
  input: {
    width: "70%",
    padding: "10px",
    borderRadius: "5px",
    marginRight: "10px",
    fontSize: "16px",
    border: "1px solid #ccc"
  },
  controls: {
    marginTop: "15px"
  },
  enterBtn: {
    padding: "10px 20px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#3ca176",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer"
  },
  mic: {
    fontSize: "24px",
    cursor: "pointer"
  },
  listening: {
    marginTop: "10px",
    color: "#ffc107"
  }
};

import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import AppBar from "../components/AppBar";

export default function HistoryPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.sub || decoded.user_id || decoded.id;

      api.get(`/therapist/get-history/${userId}`)
        .then(res => setMessages(res.data.conversation || []))
        .catch(err => console.error("Error loading conversations", err));
    }
  }, []);

  return (
  <>
    <AppBar />
    <div style={styles.container}>
      <h2>Recent Conversations</h2>
      {messages.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        messages.map((msg, i) => (
          <div key={i} style={styles.card}>
            <p><strong>{msg.role === "user" ? "You" : "Therapist"}:</strong> {msg.text}</p>
            <p><strong>Emotion:</strong> {msg.emotion}</p>
          </div>
        ))
      )}
    </div>
  </>
);

}

const styles = {
  container: {
    padding: "20px",
    color: "#fff",
    backgroundColor: "#003b5b",
    borderRadius: "10px",
    maxWidth: "800px",
    margin: "30px auto"
  },
  card: {
    marginBottom: "15px",
    backgroundColor: "#01507c",
    padding: "15px",
    borderRadius: "8px"
  }
};

import React, { useState, useEffect } from 'react';
import MicInput from './MicInput';
import ChatBox from './ChatBox';
import AppBar from '../components/AppBar';
import { jwtDecode } from 'jwt-decode';

import api from '../utils/axios';

export default function DashboardPage() {
  const [conversation, setConversation] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub); // assumes user_id is stored as `sub`
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }
  }, []);

  const saveConversation = async (userMessage, therapistReply, emotion) => {
    if (!userId) return;
    try {
      const res = await api.post("/therapist/save-history", {
        user_id: userId,
        user_message: userMessage,
        therapist_reply: therapistReply,
        emotion: emotion
      });
      console.log("Saved conversation:", res.data);
    } catch (err) {
      console.error("Error saving conversation:", err);
    }
  };

  const handleResponse = ({ userText, emotion, therapistText }) => {
    setConversation(prev => [
      ...prev,
      { role: 'user', text: userText, emotion },
      { role: 'therapist', text: therapistText }
    ]);
    saveConversation(userText, therapistText, emotion); // Save to backend
  };

  return (
    <div style={styles.page}>
      <AppBar />
      <div style={styles.container}>
        <div style={styles.chatSection}>
          <ChatBox messages={conversation} userId={userId} />
        </div>
        <div style={styles.inputSection}>
          <MicInput onResponse={handleResponse} userId={userId} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundImage: "url('/beach.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "Arial, sans-serif"
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    justifyContent: "space-between"
  },
  chatSection: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1100px",
    marginBottom: "30px"
  },
  inputSection: {
    width: "100%",
    maxWidth: "700px"
  }
};

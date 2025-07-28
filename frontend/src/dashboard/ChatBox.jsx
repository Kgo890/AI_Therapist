import React from 'react';

export default function ChatBox({ messages }) {
  return (
    <div style={styles.container}>
      <div style={styles.userBox}>
        <h3>Chat box</h3>
        {messages.map((msg, index) =>
          msg.role === 'user' && (
            <div key={index}>
              <strong>User:</strong> {msg.text} <br />
              <strong>The emotion you have is:</strong> {msg.emotion}
              <hr />
            </div>
          )
        )}
      </div>

      <div style={styles.therapistBox}>
        <h3>AI Therapist</h3>
        {messages.map((msg, index) =>
          msg.role === 'therapist' && (
            <div key={index}>
              {msg.text}
              <hr />
            </div>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    width: "100%",
    maxWidth: "1000px"
  },
  userBox: {
    backgroundColor: "#003b5b",
    color: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "45%"
  },
  therapistBox: {
    backgroundColor: "#003b5b",
    color: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "45%"
  }
};

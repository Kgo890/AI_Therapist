import React, { useState } from "react";
import api from "../auth/axios";
import {
  Container,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const navigate = useNavigate();


  async function loggingIn() {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      setSnackbar({ open: true, message: "Login successful!", severity: "success" });
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login failed", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Unknown error",
        severity: "error",
      });
    }
  }

  function goToRegisterPage() {
    navigate("/register");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/login.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Container maxWidth="xs" sx={{ backgroundColor: "rgba(255,255,255,0.95)", padding: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          DCU News Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
          <Button variant="contained" onClick={loggingIn}>
            Login
          </Button>
          <Button variant="outlined" onClick={goToRegisterPage}>
            Register
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
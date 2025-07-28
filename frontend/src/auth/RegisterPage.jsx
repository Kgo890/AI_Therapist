import React, { useState } from "react";
import api from "../utils/axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });


  async function handleRegister() {
    if (!email || !username || !password) {
      setSnackbar({
        open: true,
        message: "All fields are required.",
        severity: "warning",
      });
      return;
    }

    try {
      await api.post("/auth/register", {
        email,
        username,
        password,
      });

      setSnackbar({ open: true, message: "Registration successful!", severity: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Registering failed", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Unknown error",
        severity: "error",
      });
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/reset_register.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          backgroundColor: "rgba(255,255,255,0.95)",
          padding: 4,
          borderRadius: 2,
          boxShadow: 6,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Register
        </Typography>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Box mt={2}>
          <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
            Register
          </Button>
        </Box>

        <Box mt={2} textAlign="center">
          <Link component={RouterLink} to="/" underline="hover">
            Already have an account? Login here
          </Link>
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
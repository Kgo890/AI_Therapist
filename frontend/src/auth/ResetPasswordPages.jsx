import React, { useState } from "react";
import api from "../auth/axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchAppBar from "../components/AppBar";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [searchQuery, setSearchQuery] = useState("");


  async function handleReset() {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSnackbar({ open: true, message: "Password reset successful!", severity: "success" });
      setEmail("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Password reset failed", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || "Reset failed",
        severity: "error"
      });
    }
  }

  return (
    <>
      <SearchAppBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url('/reset_register.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Container maxWidth="xs" sx={{ backgroundColor: "rgba(255,255,255,0.95)", padding: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Reset Password
          </Typography>

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Box mt={2}>
            <Button variant="contained" color="primary" fullWidth onClick={handleReset}>
              Reset Password
            </Button>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
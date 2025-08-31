import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import Header from "./Header";

const LoginPage = ({ isLoggedIn, onLoginToggle }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  // const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const handleLogin = async () => {
    // console.log("Attempting login with:", { username, password });
    // console.log("Backend URL:", BACKEND_URL);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginToggle(); // successful login, toggle state in App.js
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLoginToggle={onLoginToggle} />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          pt: 8,
        }}
      >
        <Paper sx={{ p: 4, width: 300 }}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Username"
            fullWidth
            sx={{ mb: 2 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
          >
            Log In
          </Button>
        </Paper>
      </Box>
    </>
  );
};

export default LoginPage;
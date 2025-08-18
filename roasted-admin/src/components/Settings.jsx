import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

const Settings = () => {
  // ---- Password states ----
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // ---- Email states ----
  const [oldEmail, setOldEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // ---- Change password ----
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      setLoadingPassword(true);

      const res = await fetch("http://localhost:5002/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to change password");
      }

      setPasswordSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Something went wrong.");
    } finally {
      setLoadingPassword(false);
    }
  };

  // ---- Cancel password form ----
  const handlePasswordCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  // ---- Change email ----
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!oldEmail.includes("@")) {
      setEmailError("Please enter your current email address.");
      return;
    }

    if (!newEmail.includes("@")) {
      setEmailError("Please enter a valid new email address.");
      return;
    }

    try {
      setLoadingEmail(true);

      const res = await fetch("http://localhost:5002/api/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldEmail, newEmail }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to change email");
      }

      setEmailSuccess("Email updated successfully!");
      setOldEmail("");
      setNewEmail("");
    } catch (err) {
      setEmailError(err.message || "Something went wrong.");
    } finally {
      setLoadingEmail(false);
    }
  };

  // ---- Cancel email form ----
  const handleEmailCancel = () => {
    setOldEmail("");
    setNewEmail("");
    setEmailError("");
    setEmailSuccess("");
  };

  return (
    <Paper sx={{ p: 4, width: "100%", mx: "auto", mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Account Settings
      </Typography>

      {/* Change Email Section */}
      <Box component="form" onSubmit={handleEmailSubmit}>
        <Typography variant="subtitle1" gutterBottom>
          Change Email
        </Typography>

        {emailError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {emailError}
          </Alert>
        )}
        {emailSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {emailSuccess}
          </Alert>
        )}

        <TextField
          label="Old Email"
          type="email"
          fullWidth
          margin="normal"
          value={oldEmail}
          onChange={(e) => setOldEmail(e.target.value)}
        />
        <TextField
          label="New Email"
          type="email"
          fullWidth
          margin="normal"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loadingEmail}
            fullWidth
          >
            {loadingEmail ? <CircularProgress size={24} /> : "Update Email"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleEmailCancel}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Change Password Section */}
      <Box component="form" onSubmit={handlePasswordSubmit}>
        <Typography variant="subtitle1" gutterBottom>
          Change Password
        </Typography>

        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}
        {passwordSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {passwordSuccess}
          </Alert>
        )}

        <TextField
          label="Old Password"
          type="password"
          fullWidth
          margin="normal"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loadingPassword}
            fullWidth
          >
            {loadingPassword ? (
              <CircularProgress size={24} />
            ) : (
              "Update Password"
            )}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handlePasswordCancel}
            fullWidth
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Settings;


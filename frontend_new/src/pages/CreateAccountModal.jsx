import React, { useState } from "react";
import "./modal.css";

function CreateAccountModal({ onClose, onEmailSignUp, onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Call the function passed from App.js
    await onEmailSignUp(email, password);

    // Clear the form (optional)
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Create Account</h2>

        {error && <div style={{ color: '#c33', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <button type="submit" className="primary-btn">
            Create Account
          </button>
        </form>

        <p className="modal-footer">
          Already have an account?{" "}
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#008080', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={onSignIn}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default CreateAccountModal;

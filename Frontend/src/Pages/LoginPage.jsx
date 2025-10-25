import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "../Components/Header";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.password) return "Please enter your password.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    return "";
    }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) return setError(msg);

    try {
      setSubmitting(true);
      setError("");
      // TODO: call your backend to log in
      await new Promise((r) => setTimeout(r, 600));
      navigate("/AccountPage");
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="LoginPage">
      <Header />
      <main className="auth-page">
        <h1 className="auth-title">Log in</h1>

        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <label className="auth-field">
            <span className="auth-label">Email:</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password:</span>
            <input
              className="auth-input"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "SIGN IN"}
          </button>

          <div className="auth-links">
            <Link to="/ForgotPassword" className="auth-muted-link">
              Forgot your password?
            </Link>
            <Link to="/CreateAccountPage" className="auth-muted-link">
              Don’t have an account yet?
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

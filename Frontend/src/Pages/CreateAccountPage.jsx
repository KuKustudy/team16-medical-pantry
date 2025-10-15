import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../Components/Header";
import "./CreateAccountPage.css";

export function CreateAccountPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validate() {
    if (!form.username.trim()) return "Please enter a username.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Please enter a valid email.";
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
      // TODO: call your backend to create the account
      // await fetch("/api/signup", { method: "POST", body: JSON.stringify(form) })
      // For now just simulate success:
      await new Promise(r => setTimeout(r, 600));
      navigate("/AccountPage"); // or wherever you want to land after create
    } catch (err) {
      setError("Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="CreateAccountPage">
      <Header />
      <main className="auth-page">
        <h1 className="auth-title">Create new account</h1>

        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <label className="auth-field">
            <span className="auth-label">Username:</span>
            <input
              className="auth-input"
              name="username"
              type="text"
              placeholder="Your name"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Email:</span>
            <input
              className="auth-input"
              name="email"
              type="email"
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
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "CREATE"}
          </button>

          <div className="auth-links">
            <Link to="/AccountPage" className="auth-muted-link">
              Already have an account?
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

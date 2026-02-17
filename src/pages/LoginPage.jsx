import { useState } from "react";
import { api } from "../api";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.post("/api/auth/register", form);
        setMode("login");
        setForm({ userName: "", email: "", password: "" });
        setError("");
        return;
      }
      await api.post("/api/auth/login", {
        userName: form.userName,
        email: form.email,
        password: form.password,
      });
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">✦</div>
          <span className="login-logo-text">NeuralChat</span>
        </div>

        <h1 className="login-title">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="login-subtitle">
          {mode === "login" ? "// sign in to continue" : "// join and start chatting"}
        </p>

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              placeholder="your_username"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              required
            />
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="login-switch">
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("register"); setError(""); }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
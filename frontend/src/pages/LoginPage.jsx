import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ authUser, onLogin, onLogout }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onLogin({ username, password });
      navigate("/my-votes", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container login-page">
      <form className="card login-card" onSubmit={submit}>
        <Link className="inline-link" to="/proposals">Back to home</Link>
        <h1>Log in</h1>
        <p className="muted">Use demo credentials to access protected features.</p>

        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="you@city.org"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <div className="login-primary-actions">
          <button disabled={busy} type="submit" className="auth-primary-button">{busy ? "Signing in..." : "Log in"}</button>
        </div>

        {authUser && (
          <div className="login-status-bar">
            <span className="muted">Signed in as {authUser.username} ({authUser.role})</span>
            <button type="button" className="secondary login-logout-button" onClick={onLogout}>Logout</button>
          </div>
        )}

        {!authUser && (
          <div className="login-helper-row muted">
            <span>Use the demo credentials below to access protected features.</span>
          </div>
        )}

        <div className="demo-row">
          <button type="button" className="secondary" disabled>
            Demo: voter
          </button>
          <button type="button" className="secondary" disabled>
            Demo: admin
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

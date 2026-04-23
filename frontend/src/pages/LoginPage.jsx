import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="container">
      <h1>Sign in</h1>
      <p className="muted">Use demo credentials to access protected features.</p>

      <form className="card" onSubmit={submit}>
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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

        <div className="row" style={{ marginTop: 12 }}>
          <button disabled={busy} type="submit">{busy ? "Signing in..." : "Login"}</button>
          <button type="button" className="secondary" onClick={onLogout}>Logout</button>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          Demo: alice/password, bob/password, admin/admin123
        </p>
        {authUser && <div className="success">Signed in as {authUser.username} ({authUser.role})</div>}
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

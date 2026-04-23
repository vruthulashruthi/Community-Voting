import { useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { getAuthToken, login, setAuthToken } from "./api";
import CreateProposalPage from "./pages/CreateProposalPage";
import LoginPage from "./pages/LoginPage";
import ProposalsPage from "./pages/ProposalsPage";

const USER_KEY = "voting_auth_user";

function loadStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [authUser, setAuthUser] = useState(loadStoredUser());

  const isAuthed = Boolean(getAuthToken());

  const handleLogin = async (payload) => {
    const result = await login(payload);
    setAuthUser(result.user);
    saveStoredUser(result.user);
    return result;
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    saveStoredUser(null);
  };

  return (
    <BrowserRouter>
      <header className="topnav">
        <div className="topnav-inner">
          <div className="brand">Community Voting</div>
          <nav className="nav-links">
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/proposals">Proposals</NavLink>
            <NavLink to="/create">Create</NavLink>
          </nav>
          <div className="muted user-chip">
            {authUser ? `${authUser.username} (${authUser.role})` : "Not signed in"}
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/login"
          element={<LoginPage authUser={authUser} onLogin={handleLogin} onLogout={handleLogout} />}
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute isAuthed={Boolean(getAuthToken())}>
              <ProposalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute isAuthed={Boolean(getAuthToken())}>
              <CreateProposalPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthed ? "/proposals" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

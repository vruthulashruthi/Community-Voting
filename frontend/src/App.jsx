import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { getAuthToken, login, setAuthToken } from "./api";
import CreateProposalPage from "./pages/CreateProposalPage";
import LoginPage from "./pages/LoginPage";
import MyVotesPage from "./pages/MyVotesPage";
import ProposalDetailPage from "./pages/ProposalDetailPage";
import ProposalsPage from "./pages/ProposalsPage";

function ProtectedRoute({ isAuthed, children }) {
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout({ authUser, proposalSearch, setProposalSearch, isAuthed, handleLogin, handleLogout }) {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  return (
    <>
      {isLoginRoute ? (
        <header className="login-brand-only">
          <div className="login-brand-only-title">Ballot.</div>
        </header>
      ) : (
        <header className="topnav">
          <div className="topnav-inner">
            <div className="brand-wrap">
              <div className="brand-mark">✉</div>
              <div className="brand">Ballot.</div>
            </div>
            <div className="topnav-search-wrap">
              <input
                className="topnav-search"
                type="search"
                placeholder="Search proposals, authors..."
                aria-label="Search proposals"
                value={proposalSearch}
                onChange={(e) => setProposalSearch(e.target.value)}
              />
            </div>
            <nav className="nav-links">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/my-votes">My votes</NavLink>
              <NavLink to="/proposals">Proposals</NavLink>
            </nav>
            <NavLink className="new-proposal-pill" to="/create">
              + New proposal
            </NavLink>
            <div className="muted user-chip">
              {authUser ? `${authUser.username} (${authUser.role})` : "Not signed in"}
            </div>
          </div>
        </header>
      )}

      <Routes>
        <Route
          path="/login"
          element={<LoginPage authUser={authUser} onLogin={handleLogin} onLogout={handleLogout} />}
        />
        <Route
          path="/my-votes"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <MyVotesPage authUser={authUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <ProposalsPage searchQuery={proposalSearch} onSearchQueryChange={setProposalSearch} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/:proposalId"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <ProposalDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute isAuthed={isAuthed}>
              <CreateProposalPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthed ? "/my-votes" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [proposalSearch, setProposalSearch] = useState("");

  useEffect(() => {
    setAuthToken(null);
  }, []);

  const isAuthed = Boolean(authUser && getAuthToken());

  const handleLogin = async (payload) => {
    const result = await login(payload);
    setAuthUser(result.user);
    return result;
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
  };

  return (
    <BrowserRouter>
      <AppLayout
        authUser={authUser}
        proposalSearch={proposalSearch}
        setProposalSearch={setProposalSearch}
        isAuthed={isAuthed}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

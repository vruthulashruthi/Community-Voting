import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "voting_auth_token";

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (payload) =>
  api.post("/auth/login", payload).then((r) => {
    const token = r.data?.access_token;
    if (token) setAuthToken(token);
    return r.data;
  });

export const listProposals = () => api.get("/proposals/").then((r) => r.data);
export const getProposal = (id) => api.get(`/proposals/${id}`).then((r) => r.data);
export const createProposal = (payload) => api.post("/proposals/", payload).then((r) => r.data);
export const castVote = (id, payload) => api.post(`/proposals/${id}/vote`, payload).then((r) => r.data);
export const closeProposal = (id) => api.patch(`/proposals/${id}/close`).then((r) => r.data);
export const revokeVote = (voteId) => api.delete(`/votes/${voteId}`).then((r) => r.data);

export default api;

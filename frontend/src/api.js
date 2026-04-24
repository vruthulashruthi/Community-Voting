import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

const tokenKey = "voting_auth_token";

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(tokenKey, token);
  } else {
    localStorage.removeItem(tokenKey);
  }
};

export const getAuthToken = () => localStorage.getItem(tokenKey);

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (payload) => {
  const response = await api.post("/auth/login", payload);
  const token = response.data?.access_token;
  if (token) {
    setAuthToken(token);
  }
  return response.data;
};

export const listProposals = async () => {
  const response = await api.get("/proposals/");
  return response.data;
};

export const getProposal = async (id) => {
  const response = await api.get(`/proposals/${id}`);
  return response.data;
};

export const createProposal = async (payload) => {
  const response = await api.post("/proposals/", payload);
  return response.data;
};

export const castVote = async (id, payload) => {
  const response = await api.post(`/proposals/${id}/vote`, payload);
  return response.data;
};

export const closeProposal = async (id) => {
  const response = await api.patch(`/proposals/${id}/close`);
  return response.data;
};

export const revokeVote = async (voteId) => {
  const response = await api.delete(`/votes/${voteId}`);
  return response.data;
};

export default api;

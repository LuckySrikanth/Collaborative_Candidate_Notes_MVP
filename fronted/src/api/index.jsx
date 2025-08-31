const API_BASE_URL = "http://localhost:4000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }
  return response.json();
};

export const getCandidates = async () => {
  const response = await fetch(`${API_BASE_URL}/candidates`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch candidates");
  return response.json();
};

export const createCandidate = async (name, email) => {
  const response = await fetch(`${API_BASE_URL}/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, email }),
  });
  if (!response.ok) throw new Error("Failed to create candidate");
  return response.json();
};

export const getCandidateNotes = async (candidateId) => {
  const response = await fetch(`${API_BASE_URL}/notes/${candidateId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch candidate notes");
  return response.json();
};

// No direct API for sending notes, as this will be handled via Socket.io

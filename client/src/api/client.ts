import axios from "axios";

const GUEST_ID_KEY = "linkup_guest_id";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the guest ID to every API request
api.interceptors.request.use(
  (config) => {
    const guestId = localStorage.getItem(GUEST_ID_KEY);

    if (guestId) {
      config.headers["x-guest-id"] = guestId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle expired/invalid guest sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(GUEST_ID_KEY);
    }

    return Promise.reject(error);
  },
);
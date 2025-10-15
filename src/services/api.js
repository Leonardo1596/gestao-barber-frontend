import axios from "axios";

// Create an Axios instance
const api = axios.create({
	baseURL: "http://localhost:8000", // Base URL of the API
});

// Request interceptor: Automatically adds an authentication token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token"); // Retrieve token from localStorage
		if (token) {
			config.headers.Authorization = `Bearer ${token}`; // Add token to headers
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor: Handles global errors like 401 (unauthorized)
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Redirect to login if token is invalid
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export default api;

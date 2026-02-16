import axios from 'axios';

// Dynamically determine the API URL
// Use environment variable for API URL in production, fallback to localhost for dev
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

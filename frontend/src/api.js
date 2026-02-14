import axios from 'axios';

// Dynamically determine the API URL
const hostname = window.location.hostname;
const API_URL = `http://${hostname}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

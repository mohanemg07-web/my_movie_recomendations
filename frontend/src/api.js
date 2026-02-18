import axios from 'axios';

// Hardcoded for reliability
const API_URL = 'https://my-movie-recommendations.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

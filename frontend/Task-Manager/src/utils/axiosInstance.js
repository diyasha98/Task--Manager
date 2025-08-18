import axios from 'axios';
import {API_BASE_URL} from './apiPaths.js';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: "application/json"
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            // Remove quotes if token was stored with JSON.stringify
            const cleanToken = accessToken.replace(/^"(.*)"$/, '$1');
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors globally
        if (error.response) {
            if (error.response.status === 401) {
                // Clear invalid token before redirect
                localStorage.removeItem('token');
                // Handle unauthorized access (e.g., redirect to login page)
                window.location.href = '/login';
            } else if (error.response.status === 500) {
                // Handle server errors (e.g., show error message)
                console.error('Server error Please try again later:', error.response.data);
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out, please try again:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
// Import necessary modules and utilities
import axios from 'axios';
// import { LocalStorage } from '../utils';

// Create an Axios instance for API requests
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URI,
    withCredentials: true,
    timeout: 120000,
});

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
    function (config) {
        // Retrieve user token from local storage

        // const token = LocalStorage.get('token');

        // Set authorization header with bearer token

        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// API functions for different actions
export const loginUser = (data: { username: string; password: string }) => {
    return apiClient.post('/user/login', data);
};

export const registerUser = (data: {
    email: string;
    password: string;
    username: string;
}) => {
    return apiClient.post('/user/register', data);
};
// Import necessary modules and utilities
import axios from 'axios';
import { LocalStorage } from '../utils';
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

        const token = LocalStorage.get('token');

        // Set authorization header with bearer token

        config.headers.Authorization = `Bearer ${token}`;
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

export const getUserChats = () => {
    return apiClient.get(`/chats`);
};

export const getChatMessages = (chatId: string) => {
    return apiClient.get(`/messages/${chatId}`);
};

export const sendMessage = (chatId: string, 
    content: string, 
    // attachments: File[]
    ) => {
    // const formData = new FormData();
    // if (content) {
    //     formData.append('content', content);
    // }
    // attachments?.map((file) => {
    //     formData.append('attachments', file);
    // });
    let formData = {
        content : content
    }
    return apiClient.post(`/messages/${chatId}`, formData);
};

export const getAvailableUsers = () => {
    return apiClient.get('/chats/users');
};

export const createUserChat = (receiverId: string) => {
    return apiClient.post(`/chats/c/${receiverId}`);
};

export const createGroupChat = (data: { name: string; participants: string[] }) => {
    console.log('group');
    
    return apiClient.post(`/chats/group`, data);
};

export const deleteOneOnOneChat = (chatId: string) => {
    return apiClient.delete(`/chats/remove/${chatId}`);
};
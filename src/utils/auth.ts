import { requestHandler } from '.';
import { loginUser, registerUser } from '../api';
import { userDetails } from '../signals/AuthSignals';
import { route } from 'preact-router';
// Function to handle user login
export const login = async (data: { username: string; password: string }) => {
    await requestHandler(
        async () => await loginUser(data),
        (res) => {
            const { data } = res;
            userDetails.value = data.user;
            // setToken(data.accessToken);
            // LocalStorage.set('user', data.user);
            // LocalStorage.set('token', data.accessToken);
            route('/chat', true); // Redirect to the chat page after successful login
        },
        alert // Display error alerts on request failure
    );
};

// Function to handle user registration
export const register = async (data: {
    email: string;
    username: string;
    password: string;
}) => {
    await requestHandler(
        async () => await registerUser(data),
        () => {
            alert('Account created successfully! Go ahead and login.');
            route(`/login?username=${data.username}&password=${data.password}`); // Redirect to the login page after successful registration
        },
        alert // Display error alerts on request failure
    );
};

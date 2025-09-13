import api from './api';

// Function for user login
export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });

        // console.log(response.data);

        // Checks if the login was successful
        if (response.data.message === 'Logado com sucesso') {
            const token = response.data.token;
            const userInfo = response.data.user;
            localStorage.setItem('token', token); // Stores the token in localStorage
            localStorage.setItem('user', JSON.stringify(userInfo)); // Stores user info in localStorage
            return userInfo;
        } else {
            throw new Error(response.data.message || 'Erro desconhecido'); // Throws a custom message
        }
    } catch (error) {
        // Handles errors returned by the backend
        if (error) {
            console.log(error.response.data);
            throw new Error(error.message); // Throws the backend's error message
        }

        // Handles generic errors not coming from the backend
        throw new Error('Erro ao fazer login. Tente novamente.');
    }
};

// Function for user registration
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data; // Returns the API response (success or failure)
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao registrar');
    }
};

// Function for user logout
export const logout = () => {
    localStorage.removeItem('token'); // Removes the token from localStorage
    localStorage.removeItem('user'); // Removes user data from localStorage
    window.location.href = '/'; // Redirects to the login page
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if the token exists, false otherwise
};

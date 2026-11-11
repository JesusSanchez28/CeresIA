import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // URL de nuestro backend en Node.js
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
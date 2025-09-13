import axios from 'axios';

const http = axios.create({ baseURL: '' });

http.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default http;
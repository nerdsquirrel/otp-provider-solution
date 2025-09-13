import http from './http';

export async function login({ username, password }) {
    const res = await http.post('/api/auth/token', { username, password });
    return res.data.token;
}

export async function registerUser({ username, email, password }) {
    await http.post('/api/auth/register', { username, email, password });
}

export async function sendOtp({ method, to, otp }) {
    // method: 'Sms' | 'Email'
    const payload = { method, to, otp };
    const res = await http.post('/api/otp/send', payload);
    return res.data;
}
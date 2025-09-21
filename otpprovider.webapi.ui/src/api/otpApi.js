import http from './http';

export async function sendOtp({ method, to, purpose }) {
    const payload = { method, to, purpose };
    const res = await http.post('/api/otp/send', payload);
    return res.data;
}

export async function verifyOtp({ requestId, otp }) {
    const res = await http.post('/api/otp/verify', { requestId, otp });
    return res.data;
}
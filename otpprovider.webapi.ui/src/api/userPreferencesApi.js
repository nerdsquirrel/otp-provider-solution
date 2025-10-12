import http from './http';

export async function getUserPreferences() {
    const res = await http.get('/api/userpreferences');
    return res.data;
}

export async function saveUserPreferences(prefs) {
    const res = await http.put('/api/userpreferences', prefs);
    return res.data;
}
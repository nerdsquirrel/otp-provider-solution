import http from './http';

export async function getDashboardStats(minutes = 1440) {
    const res = await http.get(`/api/dashboard/stats?minutes=${minutes}`);
    return res.data;
}

export async function getRecentOtpActivity(limit = 10) {
    const res = await http.get(`/api/dashboard/recent?limit=${limit}`);
    return res.data;
}
import http from './http';

/**
 * Get OTP providers.
 * @param {Object} [options]
 * @param {boolean} [options.onlyActive] When true, filters to active providers.
 */
export async function getOtpProviders(options = {}) {
    const params = {};
    if (typeof options.onlyActive === 'boolean') {
        params.onlyActive = options.onlyActive;
    }
    const { data } = await http.get('/api/otpproviders', Object.keys(params).length ? { params } : undefined);
    return data;
}

/**
 * Get a single OTP provider by id.
 * @param {number} id
 */
export async function getOtpProvider(id) {
    const { data } = await http.get(`/api/otpproviders/${id}`);
    return data;
}

/**
 * Create a new OTP provider.
 */
export async function createOtpProvider(payload) {
    const { data } = await http.post('/api/otpproviders', payload);
    return data;
}

/**
 * Update an existing OTP provider.
 */
export async function updateOtpProvider(id, payload) {
    const { data } = await http.put(`/api/otpproviders/${id}`, payload);
    return data;
}

/**
 * Delete an OTP provider.
 */
export async function deleteOtpProvider(id, options = {}) {
    const { hard = false } = options;
    await http.delete(`/api/otpproviders/${id}`, hard ? { params: { hard: true } } : undefined);
}

export async function softDeleteOtpProvider(id) {
    return deleteOtpProvider(id, { hard: false });
}

export async function hardDeleteOtpProvider(id) {
    return deleteOtpProvider(id, { hard: true });
}

/**
 * NEW: Fetch delivery type options (enum values) from backend.
 * Returns [{ value: 'SMS', label: 'SMS' }, ...]
 */
export async function getDeliveryTypes() {
    const { data } = await http.get('/api/otpproviders/delivery-types');
    return data;
}
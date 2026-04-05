/**
 * API Service — centralises all HTTP calls to the Spring Boot backend.
 *
 * When served from Spring Boot (port 8080): uses relative '/api' path
 * When running on Vite dev server (port 5173): uses absolute 'http://localhost:8080/api'
 */

const getApiBase = () => {
    let url = import.meta.env.VITE_API_URL || 'https://final-year-project-2-fp45.onrender.com';
    if (!import.meta.env.VITE_API_URL) {
        console.warn('VITE_API_URL is not defined. Falling back to default:', url);
    }
    // Remove all trailing slashes first
    url = url.replace(/\/+$/, '');
    
    // If it already ends with /api, return as is
    if (url.endsWith('/api')) return url;
    
    // Otherwise append /api
    return `${url}/api`;
};

export const API_BASE = getApiBase();
console.log('API_BASE Resolved to:', API_BASE);


/** Get the stored JWT token from localStorage or sessionStorage */
export function getToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

/** Get fetch options for manual calls (handling auth header) */
export function getManualOptions(method = 'POST', isMultipart = false) {
    const token = getToken();
    const headers = {};
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return { method, headers };
}

/** Build standard fetch options with JSON body + auth header */
function options(method = 'GET', body = null) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };
}

/** Helper — throws a friendly error from an API response */
async function handleResponse(res) {
    if (res.ok) {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }
    let errorMsg = `Error ${res.status}`;
    try {
        const err = await res.json();
        errorMsg = err.message || errorMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(errorMsg);
}

/** Error check for network failures (Backend Offline) */
export function isNetworkError(err) {
    const msg = String(err.message || err).toLowerCase();
    return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed');
}

// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
export const authApi = {
    login: (email, password, rememberMe = false) =>
        fetch(`${API_BASE}/auth/login`, options('POST', { email: email.trim().toLowerCase(), password, rememberMe }))
            .then(handleResponse),

    register: (name, email, phone, password, confirmPassword, userType) =>
        fetch(`${API_BASE}/auth/register`, options('POST', {
            name, email: email.trim().toLowerCase(), phone, password, confirmPassword, userType
        })).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  EMAIL VERIFICATION
// ═══════════════════════════════════════════════════════
export const verificationApi = {
    /** Send OTP to an email (also used as resend) */
    send: (email) =>
        fetch(`${API_BASE}/verification/send`, options('POST', { email: email.trim().toLowerCase() }))
            .then(handleResponse),

    /** Alias for send — semantically clearer on the resend button */
    resend: (email) =>
        fetch(`${API_BASE}/verification/send`, options('POST', { email: email.trim().toLowerCase() }))
            .then(handleResponse),

    /** Verify the user-entered OTP */
    verify: (email, otp) =>
        fetch(`${API_BASE}/verification/verify`, options('POST', { email: email.trim().toLowerCase(), otp }))
            .then(handleResponse),

    /** Get verification status for an email */
    status: (email) =>
        fetch(`${API_BASE}/verification/status?email=${encodeURIComponent(email.trim().toLowerCase())}`, options('GET'))
            .then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════
export const productApi = {
    getAll: ({ search = '', category = '', sort = 'newest', page = 0, size = 50 } = {}) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category && category !== 'all') params.set('category', category);
        if (sort) params.set('sort', sort);
        params.set('page', page);
        params.set('size', size);
        return fetch(`${API_BASE}/products?${params}`, options('GET')).then(handleResponse);
    },

    getById: (id) =>
        fetch(`${API_BASE}/products/${id}`, options('GET')).then(handleResponse),

    create: (product) =>
        fetch(`${API_BASE}/products`, options('POST', {
            name: product.name,
            price: product.price,
            category: (product.category || 'OTHER').toUpperCase(),
            imageUrl: product.image,
            rating: product.rating || 0,
            description: product.desc,
            farmerName: product.farmer,
            certified: product.certified ?? true,
        })).then(handleResponse),

    update: (id, product) =>
        fetch(`${API_BASE}/products/${id}`, options('PUT', {
            name: product.name,
            price: product.price,
            category: (product.category || 'OTHER').toUpperCase(),
            imageUrl: product.image,
            rating: product.rating || 0,
            description: product.desc,
            farmerName: product.farmer,
            certified: product.certified ?? true,
        })).then(handleResponse),

    delete: (id) =>
        fetch(`${API_BASE}/products/${id}`, options('DELETE')).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════
export const orderApi = {
    /**
     * Place an order. Only productId + quantity are sent — prices come from backend.
     * @param {Object} orderData - { items: [{productId, quantity}], deliveryName,
     *   deliveryAddress, deliveryCity, deliveryState, deliveryPincode, deliveryPhone,
     *   paymentMethod: 'COD'|'ONLINE', promoCode? }
     */
    place: (orderData) =>
        fetch(`${API_BASE}/orders`, options('POST', orderData)).then(handleResponse),

    getMyOrders: (page = 0, size = 10) =>
        fetch(`${API_BASE}/orders?page=${page}&size=${size}`, options('GET')).then(handleResponse),

    getById: (id) =>
        fetch(`${API_BASE}/orders/${id}`, options('GET')).then(handleResponse),

    /** Validate a coupon code — returns { code, discount, valid } */
    validatePromo: (code, subtotal) =>
        fetch(`${API_BASE}/orders/validate-promo`, options('POST', { code, subtotal }))
            .then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  ADDRESSES
// ═══════════════════════════════════════════════════════
export const addressApi = {
    getAll: () =>
        fetch(`${API_BASE}/addresses`, options('GET')).then(handleResponse),

    save: (addressData) =>
        fetch(`${API_BASE}/addresses`, options('POST', addressData)).then(handleResponse),

    delete: (id) =>
        fetch(`${API_BASE}/addresses/${id}`, options('DELETE')).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  PAYMENTS
// ═══════════════════════════════════════════════════════
export const paymentApi = {
    /**
     * Initiate online payment — returns { gatewayOrderId, amount, currency }
     */
    initiate: (orderId) =>
        fetch(`${API_BASE}/payments/initiate`, options('POST', { orderId })).then(handleResponse),

    /**
     * Verify payment after gateway callback.
     * @param {Object} verifyData - { orderId, gatewayPaymentId, gatewaySignature, gatewayOrderId }
     */
    verify: (verifyData) =>
        fetch(`${API_BASE}/payments/verify`, options('POST', verifyData)).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  FARMER REGISTRATION
// ═══════════════════════════════════════════════════════
export const farmerApi = {
    register: (formData, certificateFile) => {
        const token = getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const multipart = new FormData();
        multipart.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (certificateFile) multipart.append('certificate', certificateFile);

        return fetch(`${API_BASE}/farmers/register`, { method: 'POST', headers, body: multipart })
            .then(handleResponse);
    },

    getStatus: (id) =>
        fetch(`${API_BASE}/farmers/registration/${id}`, options('GET')).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  CONTACT
// ═══════════════════════════════════════════════════════
export const contactApi = {
    send: (formData) =>
        fetch(`${API_BASE}/contact`, options('POST', formData)).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  AI TOOLS
// ═══════════════════════════════════════════════════════
export const aiApi = {
    cropRecommendation: (data) =>
        fetch(`${API_BASE}/ai-tools/crop-recommendation`, options('POST', data)).then(handleResponse),

    resourceManagement: (data) =>
        fetch(`${API_BASE}/ai-tools/resource-management`, options('POST', data)).then(handleResponse),

    weatherForecast: (location) =>
        fetch(`${API_BASE}/ai-tools/weather-forecast`, options('POST', { location })).then(handleResponse),

    soilAnalysis: (data) =>
        fetch(`${API_BASE}/ai-tools/soil-analysis`, options('POST', data)).then(handleResponse),
};

// ═══════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════
export const adminApi = {
    /** Get all pending farmer registrations with enriched details */
    getPendingFarmers: () =>
        fetch(`${API_BASE}/admin/pending-farmers`, options('GET')).then(handleResponse),

    /** Get all farmers (approved + pending) */
    getAllFarmers: () =>
        fetch(`${API_BASE}/admin/all-farmers`, options('GET')).then(handleResponse),

    /** Approve a farmer by user ID */
    approveFarmer: (userId) =>
        fetch(`${API_BASE}/admin/approve-farmer/${userId}`, options('POST')).then(handleResponse),

    /** Reject a farmer by user ID with a reason */
    rejectFarmer: (userId, reason) =>
        fetch(`${API_BASE}/admin/reject-farmer/${userId}`, options('POST', { reason })).then(handleResponse),

    /** Get admin dashboard stats */
    getStats: () =>
        fetch(`${API_BASE}/admin/stats`, options('GET')).then(handleResponse),

    /** Get certificate file URL for viewing */
    getCertificateUrl: (filename) =>
        `${API_BASE}/admin/certificate/${encodeURIComponent(filename)}`,
};

/** Normalise a backend Product response to the shape the UI expects */
export function normaliseProduct(p) {
    return {
        id: p.id,
        name: p.name,
        price: typeof p.price === 'object' ? Number(p.price) : p.price,
        category: (p.category || '').toLowerCase(),
        image: p.imageUrl,
        rating: typeof p.rating === 'object' ? Number(p.rating) : (p.rating || 0),
        desc: p.description,
        farmer: p.farmerName,
        certified: p.certified,
        _created: new Date(p.createdAt).getTime(),
    };
}


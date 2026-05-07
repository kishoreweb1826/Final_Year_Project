/**
 *// Updated API service using Axios with timeout and interceptors
import axios from 'axios';

const getApiBase = () => {
    let url = import.meta.env.VITE_API_URL
        || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://final-year-project-2-fp45.onrender.com');
    url = url.replace(/\/+$/, '');
    if (url.endsWith('/api')) return url;
    return `${url}/api`;
};

export const API_BASE = getApiBase();

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Production timeout: 60 seconds for Render cold starts
const DEFAULT_TIMEOUT = 60000; // 60 seconds for production
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second, exponential backoff

/** Get the stored JWT token from localStorage or sessionStorage */
export function getToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

/**
 * Retry logic with exponential backoff
 * Handles network failures and timeouts gracefully
 */
async function retryFetch(url, options, retries = 0) {
    try {
        const response = await fetch(url, options);
        
        // If response is not OK and retryable (5xx or network), retry
        if (!response.ok && response.status >= 500 && retries < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, retries); // Exponential backoff: 1s, 2s, 4s
            console.warn(`Retry attempt ${retries + 1}/${MAX_RETRIES} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFetch(url, { ...options }, retries + 1);
        }
        
        return response;
    } catch (error) {
        // Network timeout or abort error - retry if we haven't exceeded max retries
        if (retries < MAX_RETRIES && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
            const delay = RETRY_DELAY * Math.pow(2, retries);
            console.warn(`Network error, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryFetch(url, { ...options }, retries + 1);
        }
        throw error;
    }
}

/** Get fetch options for manual calls (handling auth header) */
export function getManualOptions(method = 'POST', isMultipart = false) {
    const token = getToken();
    const headers = {};
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    return { 
        method, 
        headers, 
        signal: controller.signal,
        __timeout: timeout // Store for cleanup
    };
}

/** Build standard fetch options with JSON body + auth header */
function options(method = 'GET', body = null) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    return {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        __timeout: timeout
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
    return msg.includes('failed to fetch') 
        || msg.includes('networkerror') 
        || msg.includes('load failed')
        || msg.includes('abort')
        || msg.includes('timeout');
}

/**
 * Wrap fetch with retry logic and comprehensive error handling
 */
async function fetchWithRetry(url, opts) {
    try {
        const response = await retryFetch(url, opts);
        if (opts.__timeout) clearTimeout(opts.__timeout);
        return await handleResponse(response);
    } catch (error) {
        if (opts.__timeout) clearTimeout(opts.__timeout);
        
        // Provide helpful error messages for common failures
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. The server may be starting. Please try again.');
        }
        if (isNetworkError(error)) {
            throw new Error('Connection failed. Please check your internet connection or try again later.');
        }
        throw error;
    }
}

// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
export const authApi = {
    login: (email, password, rememberMe = false) =>
        fetchWithRetry(`${API_BASE}/auth/login`, options('POST', { email: email.trim().toLowerCase(), password, rememberMe })),

    register: (name, email, phone, password, confirmPassword, userType) =>
        fetchWithRetry(`${API_BASE}/auth/register`, options('POST', {
            name, email: email.trim().toLowerCase(), phone, password, confirmPassword, userType
        })),
};

// ═══════════════════════════════════════════════════════
//  EMAIL VERIFICATION
// ═══════════════════════════════════════════════════════
export const verificationApi = {
    /** Send OTP to an email (also used as resend) */
    send: (email) =>
        fetchWithRetry(`${API_BASE}/verification/send`, options('POST', { email: email.trim().toLowerCase() })),

    /** Alias for send — semantically clearer on the resend button */
    resend: (email) =>
        fetchWithRetry(`${API_BASE}/verification/send`, options('POST', { email: email.trim().toLowerCase() })),

    /** Verify the user-entered OTP */
    verify: (email, otp) =>
        fetchWithRetry(`${API_BASE}/verification/verify`, options('POST', { email: email.trim().toLowerCase(), otp })),

    /** Get verification status for an email */
    status: (email) =>
        fetchWithRetry(`${API_BASE}/verification/status?email=${encodeURIComponent(email.trim().toLowerCase())}`, options('GET')),
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
// Updated farmer registration handling with correct FormData syntax
export const farmerApi = {
    register: (formData, certificateFile) => {
        const token = getToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const multipart = new FormData();
        multipart.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (certificateFile) multipart.append('certificate', certificateFile);
        return fetch(`${API_BASE}/farmers/register`, { method: 'POST', headers, body: multipart }).then(handleResponse);
    },
    getStatus: id => fetch(`${API_BASE}/farmers/registration/${id}`, options('GET')).then(handleResponse)
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
        fetchWithRetry(`${API_BASE}/ai-tools/crop-recommendation`, options('POST', data)),

    resourceManagement: (data) =>
        fetchWithRetry(`${API_BASE}/ai-tools/resource-management`, options('POST', data)),

    weatherForecast: (location) =>
        fetchWithRetry(`${API_BASE}/ai-tools/weather-forecast`, options('POST', { location })),

    soilAnalysis: (data) =>
        fetchWithRetry(`${API_BASE}/ai-tools/soil-analysis`, options('POST', data)),
};

// ═══════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════
export const adminApi = {
    /** Get all pending farmer registrations with enriched details */
    getPendingFarmers: () =>
        fetchWithRetry(`${API_BASE}/admin/pending-farmers`, options('GET')),

    /** Get all farmers (approved + pending) */
    getAllFarmers: () =>
        fetchWithRetry(`${API_BASE}/admin/all-farmers`, options('GET')),

    /** Approve a farmer by user ID */
    approveFarmer: (userId) =>
        fetchWithRetry(`${API_BASE}/admin/approve-farmer/${userId}`, options('POST')),

    /** Reject a farmer by user ID with a reason */
    rejectFarmer: (userId, reason) =>
        fetchWithRetry(`${API_BASE}/admin/reject-farmer/${userId}`, options('POST', { reason })),

    /** Get admin dashboard stats */
    getStats: () =>
        fetchWithRetry(`${API_BASE}/admin/stats`, options('GET')),

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


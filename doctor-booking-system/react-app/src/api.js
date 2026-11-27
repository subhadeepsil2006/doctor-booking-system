const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Common API request function
async function apiRequest(endpoint, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });
    } catch {
        throw new Error("Unable to reach the server. Please make sure the backend is running.");
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid response received from server.");
    }

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed with status ${response.status}`
        );
    }

    return data;
}

// Public GET Request
export async function publicGet(endpoint) {
    return apiRequest(endpoint, {
        method: "GET"
    });
}

// Public POST Request (Login / Registration)
export async function publicPost(endpoint, payload) {
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

// Save Authentication
export function saveAuth(token, user) {
    if (!token || !user) {
        throw new Error("Authentication token or user data is missing.");
    }

    localStorage.setItem("carepoint_token", token);
    localStorage.setItem("carepoint_user", JSON.stringify(user));
}

// Get Authentication Token
export function getAuthToken() {
    return localStorage.getItem("carepoint_token");
}

// Get Saved User
export function getAuthUser() {
    const user = localStorage.getItem("carepoint_user");

    try {
        return user ? JSON.parse(user) : null;
    } catch {
        localStorage.removeItem("carepoint_user");
        return null;
    }
}

// Alias for backward compatibility
export function getStoredUser() {
    return getAuthUser();
}

// Clear Authentication
export function clearAuth() {
    localStorage.removeItem("carepoint_token");
    localStorage.removeItem("carepoint_user");
}

// Common Protected Request
export async function protectedRequest(endpoint, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error("Please login first.");
    }

    return apiRequest(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });
}

// Authenticated GET Request
export async function authGet(endpoint) {
    return protectedRequest(endpoint, {
        method: "GET"
    });
}

// Authenticated POST Request
export async function authPost(endpoint, payload) {
    return protectedRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

// Authenticated DELETE Request
export async function authDelete(endpoint) {
    return protectedRequest(endpoint, {
        method: "DELETE"
    });
}

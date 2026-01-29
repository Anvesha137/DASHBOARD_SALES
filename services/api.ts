
const API_URL = '/api'; // Vite proxy will handle this

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const api = {
    async request(endpoint: string, options: FetchOptions = {}) {
        let token = localStorage.getItem('accessToken');

        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        let response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle Token Expiry
        if (response.status === 403) { // Our backend sends 403 for invalid/expired access token if verified
            // Actually backend middleware sends 403 on verification failure or 401 if missing. 
            // Login returns 401 for bad creds. 
            // Let's rely on trying refresh if we get 403 (Standard is often 401 for expired, but our middleware might be specific).
            // Checking middleware: verify error returns 403. So yes.

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);

                        // Retry original request
                        const newHeaders = {
                            ...headers,
                            'Authorization': `Bearer ${data.accessToken}`,
                        };
                        response = await fetch(`${API_URL}${endpoint}`, {
                            ...options,
                            headers: newHeaders,
                        });
                    } else {
                        // Refresh failed - logout
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                } catch (e) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }

        if (!response.ok) {
            let errorMsg = 'Unknown error';
            try {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    errorMsg = errorData.error || errorData.message || JSON.stringify(errorData);
                } catch {
                    // Not JSON, use the text directly (e.g. 404 HTML or plain text)
                    errorMsg = text.slice(0, 100) || `Request failed with status ${response.status}`;
                }
            } catch (e) {
                // Failed to read text (network issue?)
                errorMsg = `Request failed with status ${response.status}`;
            }
            throw new Error(errorMsg);
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

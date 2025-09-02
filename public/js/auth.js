// Authentication utilities
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.init();
    }

    init() {
        this.updateNavigation();
        this.checkAuthOnProtectedPages();
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateNavigation();
        window.location.href = '/';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    isSeller() {
        return this.user && (this.user.role === 'seller' || this.user.role === 'admin');
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    updateNavigation() {
        const loginNav = document.getElementById('loginNav');
        const userNav = document.getElementById('userNav');
        const dashboardNav = document.getElementById('dashboardNav');
        const userName = document.getElementById('userName');

        if (this.isAuthenticated()) {
            if (loginNav) loginNav.style.display = 'none';
            if (userNav) userNav.style.display = 'block';
            if (userName) userName.textContent = `${this.user.firstName} ${this.user.lastName}`;
            
            // Show dashboard nav for sellers and admins
            if (dashboardNav && this.isSeller()) {
                dashboardNav.style.display = 'block';
            }
        } else {
            if (loginNav) loginNav.style.display = 'block';
            if (userNav) userNav.style.display = 'none';
            if (dashboardNav) dashboardNav.style.display = 'none';
        }
    }

    checkAuthOnProtectedPages() {
        const protectedPages = ['dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !this.isAuthenticated()) {
            window.location.href = '/login.html';
        }
    }

    async apiCall(url, options = {}) {
        const config = {
            ...options,
            headers: {
                ...this.getAuthHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                this.logout();
                return null;
            }

            return response;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }
}

// Global auth manager instance
const auth = new AuthManager();

// Global logout function
function logout() {
    auth.logout();
}
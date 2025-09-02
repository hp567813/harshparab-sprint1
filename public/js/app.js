// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'browse.html':
            initBrowsePage();
            break;
        case 'login.html':
            initLoginPage();
            break;
        case 'dashboard.html':
            initDashboardPage();
            break;
    }
});

// Home page initialization
async function initHomePage() {
    await loadFeaturedProperties();
}

// Load featured properties for home page
async function loadFeaturedProperties() {
    try {
        const response = await fetch('/api/properties?status=available');
        const properties = await response.json();
        
        const container = document.getElementById('featuredProperties');
        if (!container) return;
        
        // Show only first 3 properties
        const featuredProperties = properties.slice(0, 3);
        
        container.innerHTML = featuredProperties.map(property => `
            <div class="col-md-4">
                <div class="property-card">
                    <div class="position-relative">
                        <img src="${property.image_url}" alt="${property.title}" class="property-image">
                        <div class="status-badge status-${property.status}">${property.status}</div>
                        <div class="property-overlay">
                            <h5 class="fw-bold mb-2">${property.title}</h5>
                            <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${property.city}, ${property.state}</p>
                            <h4 class="fw-bold text-warning mb-0">$${Number(property.price).toLocaleString()}</h4>
                        </div>
                    </div>
                    <div class="p-3">
                        <h5 class="fw-bold mb-2">${property.title}</h5>
                        <p class="text-muted mb-2">${property.address}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="property-details">
                                <small class="text-muted">
                                    <i class="fas fa-bed me-1"></i>${property.bedrooms} bed
                                    <i class="fas fa-bath ms-2 me-1"></i>${property.bathrooms} bath
                                </small>
                            </div>
                            <h5 class="fw-bold text-primary mb-0">$${Number(property.price).toLocaleString()}</h5>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading featured properties:', error);
    }
}

// Browse page initialization
async function initBrowsePage() {
    await loadAllProperties();
    setupPropertyFilters();
}

// Load all properties for browse page
async function loadAllProperties(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/properties?${queryParams}`);
        const properties = await response.json();
        
        const container = document.getElementById('propertiesGrid');
        if (!container) return;
        
        if (properties.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-home fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No properties found</h4>
                    <p class="text-muted">Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = properties.map(property => `
            <div class="col-lg-4 col-md-6">
                <div class="property-card">
                    <div class="position-relative">
                        <img src="${property.image_url}" alt="${property.title}" class="property-image">
                        <div class="status-badge status-${property.status}">${property.status}</div>
                        <div class="property-overlay">
                            <h5 class="fw-bold mb-2">${property.title}</h5>
                            <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${property.city}, ${property.state}</p>
                            <p class="mb-2">${property.bedrooms} bed • ${property.bathrooms} bath • ${Number(property.square_feet).toLocaleString()} sq ft</p>
                            <h4 class="fw-bold text-warning mb-0">$${Number(property.price).toLocaleString()}</h4>
                        </div>
                    </div>
                    <div class="p-3">
                        <h5 class="fw-bold mb-2">${property.title}</h5>
                        <p class="text-muted mb-2">${property.address}</p>
                        <p class="small text-muted mb-3">${property.description ? property.description.substring(0, 100) + '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="property-details">
                                <small class="text-muted">
                                    <i class="fas fa-bed me-1"></i>${property.bedrooms}
                                    <i class="fas fa-bath ms-2 me-1"></i>${property.bathrooms}
                                    <i class="fas fa-ruler ms-2 me-1"></i>${Number(property.square_feet).toLocaleString()} sq ft
                                </small>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-primary mb-0">$${Number(property.price).toLocaleString()}</h5>
                            <button class="btn btn-outline-primary btn-sm" onclick="contactSeller('${property.email}', '${property.title}')">
                                <i class="fas fa-envelope me-1"></i>Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading properties:', error);
    }
}

// Setup property filters
function setupPropertyFilters() {
    const filterForm = document.getElementById('propertyFilters');
    if (!filterForm) return;
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(filterForm);
        const filters = {};
        
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                filters[key] = value.trim();
            }
        }
        
        loadAllProperties(filters);
    });
    
    // Reset filters
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            filterForm.reset();
            loadAllProperties();
        });
    }
}

// Contact seller function
function contactSeller(email, propertyTitle) {
    const subject = encodeURIComponent(`Inquiry about: ${propertyTitle}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in learning more about the property: ${propertyTitle}.\n\nPlease let me know when we can schedule a viewing.\n\nThank you!`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// Login page initialization
function initLoginPage() {
    setupLoginForm();
    setupRegisterForm();
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Signing in...';
        submitBtn.disabled = true;
        
        try {
            const result = await auth.login(email, password);
            
            if (result.success) {
                // Redirect based on user role
                if (result.user.role === 'admin' || result.user.role === 'seller') {
                    window.location.href = '/dashboard.html';
                } else {
                    window.location.href = '/browse.html';
                }
            } else {
                showAlert('error', result.error);
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Setup register form
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            role: formData.get('role')
        };
        
        // Validate password confirmation
        if (userData.password !== formData.get('confirmPassword')) {
            showAlert('error', 'Passwords do not match');
            return;
        }
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
        submitBtn.disabled = true;
        
        try {
            const result = await auth.register(userData);
            
            if (result.success) {
                showAlert('success', 'Account created successfully!');
                // Redirect based on user role
                setTimeout(() => {
                    if (result.user.role === 'admin' || result.user.role === 'seller') {
                        window.location.href = '/dashboard.html';
                    } else {
                        window.location.href = '/browse.html';
                    }
                }, 1500);
            } else {
                showAlert('error', result.error);
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Dashboard page initialization
async function initDashboardPage() {
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }
    
    await loadDashboardStats();
    await loadUserProperties();
    setupPropertyManagement();
}

// Load dashboard statistics
async function loadDashboardStats() {
    if (!auth.isAdmin()) return;
    
    try {
        const response = await auth.apiCall('/api/dashboard/stats');
        const stats = await response.json();
        
        // Update stat cards
        updateStatCard('totalUsers', stats.totalUsers, 'Users');
        updateStatCard('totalProperties', stats.totalProperties, 'Properties');
        updateStatCard('totalSales', stats.totalSales, 'Sales');
        updateStatCard('totalRevenue', `$${Number(stats.totalRevenue).toLocaleString()}`, 'Revenue');
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Update stat card
function updateStatCard(id, value, label) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Load user properties
async function loadUserProperties() {
    try {
        const response = await auth.apiCall('/api/properties');
        const allProperties = await response.json();
        
        // Filter properties based on user role
        let userProperties = allProperties;
        if (!auth.isAdmin()) {
            userProperties = allProperties.filter(p => p.seller_id === auth.user.id);
        }
        
        displayPropertiesTable(userProperties);
        
    } catch (error) {
        console.error('Error loading user properties:', error);
    }
}

// Display properties in table
function displayPropertiesTable(properties) {
    const tbody = document.getElementById('propertiesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = properties.map(property => `
        <tr>
            <td>
                <img src="${property.image_url}" alt="${property.title}" class="rounded" style="width: 60px; height: 40px; object-fit: cover;">
            </td>
            <td>
                <strong>${property.title}</strong><br>
                <small class="text-muted">${property.address}</small>
            </td>
            <td>$${Number(property.price).toLocaleString()}</td>
            <td><span class="badge bg-${getStatusColor(property.status)}">${property.status}</span></td>
            <td>${new Date(property.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProperty(${property.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProperty(${property.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get status color for badges
function getStatusColor(status) {
    switch (status) {
        case 'available': return 'success';
        case 'pending': return 'warning';
        case 'sold': return 'secondary';
        default: return 'primary';
    }
}

// Setup property management
function setupPropertyManagement() {
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', () => openPropertyModal());
    }
    
    const propertyForm = document.getElementById('propertyForm');
    if (propertyForm) {
        propertyForm.addEventListener('submit', handlePropertySubmit);
    }
}

// Property management functions
let currentPropertyId = null;

function openPropertyModal(propertyId = null) {
    currentPropertyId = propertyId;
    const modal = new bootstrap.Modal(document.getElementById('propertyModal'));
    const form = document.getElementById('propertyForm');
    const title = document.getElementById('propertyModalTitle');
    
    if (propertyId) {
        title.textContent = 'Edit Property';
        loadPropertyData(propertyId);
    } else {
        title.textContent = 'Add New Property';
        form.reset();
    }
    
    modal.show();
}

async function loadPropertyData(propertyId) {
    try {
        const response = await auth.apiCall(`/api/properties/${propertyId}`);
        const property = await response.json();
        
        // Populate form fields
        document.getElementById('propertyTitle').value = property.title;
        document.getElementById('propertyDescription').value = property.description;
        document.getElementById('propertyPrice').value = property.price;
        document.getElementById('propertyAddress').value = property.address;
        document.getElementById('propertyCity').value = property.city;
        document.getElementById('propertyState').value = property.state;
        document.getElementById('propertyZipCode').value = property.zip_code;
        document.getElementById('propertyBedrooms').value = property.bedrooms;
        document.getElementById('propertyBathrooms').value = property.bathrooms;
        document.getElementById('propertySquareFeet').value = property.square_feet;
        document.getElementById('propertyType').value = property.property_type;
        document.getElementById('propertyStatus').value = property.status;
        document.getElementById('propertyImageUrl').value = property.image_url;
        
    } catch (error) {
        console.error('Error loading property data:', error);
        showAlert('error', 'Failed to load property data');
    }
}

async function handlePropertySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const propertyData = {
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        bedrooms: formData.get('bedrooms'),
        bathrooms: formData.get('bathrooms'),
        squareFeet: formData.get('squareFeet'),
        propertyType: formData.get('propertyType'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Saving...';
    submitBtn.disabled = true;
    
    try {
        const url = currentPropertyId ? `/api/properties/${currentPropertyId}` : '/api/properties';
        const method = currentPropertyId ? 'PUT' : 'POST';
        
        const response = await auth.apiCall(url, {
            method,
            body: JSON.stringify(propertyData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('success', currentPropertyId ? 'Property updated successfully!' : 'Property created successfully!');
            bootstrap.Modal.getInstance(document.getElementById('propertyModal')).hide();
            await loadUserProperties(); // Reload the properties table
        } else {
            showAlert('error', result.error);
        }
        
    } catch (error) {
        console.error('Error saving property:', error);
        showAlert('error', 'Failed to save property');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function editProperty(propertyId) {
    openPropertyModal(propertyId);
}

async function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property?')) {
        return;
    }
    
    try {
        const response = await auth.apiCall(`/api/properties/${propertyId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('success', 'Property deleted successfully!');
            await loadUserProperties(); // Reload the properties table
        } else {
            const result = await response.json();
            showAlert('error', result.error);
        }
        
    } catch (error) {
        console.error('Error deleting property:', error);
        showAlert('error', 'Failed to delete property');
    }
}

// Utility function to show alerts
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}
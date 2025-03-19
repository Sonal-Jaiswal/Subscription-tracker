// Global variables
let subscriptions = [];
let editingId = null;
let deleteId = null;

// API base URL
const API_BASE = '/api/subscriptions';

// DOM elements
const subscriptionsList = document.getElementById('subscriptionsList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const billingCycleFilter = document.getElementById('billingCycleFilter');
const subscriptionModal = document.getElementById('subscriptionModal');
const confirmModal = document.getElementById('confirmModal');
const subscriptionForm = document.getElementById('subscriptionForm');
const modalTitle = document.getElementById('modalTitle');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSubscriptions();
    loadStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search and filter events
    searchInput.addEventListener('input', filterSubscriptions);
    categoryFilter.addEventListener('change', filterSubscriptions);
    billingCycleFilter.addEventListener('change', filterSubscriptions);
    
    // Form submission
    subscriptionForm.addEventListener('submit', handleFormSubmit);
    
    // Modal close events
    window.addEventListener('click', function(event) {
        if (event.target === subscriptionModal) {
            closeModal();
        }
        if (event.target === confirmModal) {
            closeConfirmModal();
        }
    });
}

// Load all subscriptions
async function loadSubscriptions() {
    try {
        showLoading();
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to fetch subscriptions');
        
        subscriptions = await response.json();
        renderSubscriptions(subscriptions);
        updateCategoryFilter();
    } catch (error) {
        console.error('Error loading subscriptions:', error);
        showError('Failed to load subscriptions');
    } finally {
        hideLoading();
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats/summary`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const stats = await response.json();
        updateStats(stats);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update statistics display
function updateStats(stats) {
    document.getElementById('totalSubscriptions').textContent = stats.totalSubscriptions;
    document.getElementById('totalMonthlyCost').textContent = `$${stats.totalMonthlyCost.toFixed(2)}`;
    document.getElementById('upcomingRenewals').textContent = stats.upcomingRenewals.length;
}

// Render subscriptions
function renderSubscriptions(subscriptionsToRender) {
    if (subscriptionsToRender.length === 0) {
        subscriptionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card"></i>
                <h3>No subscriptions found</h3>
                <p>Add your first subscription to get started!</p>
                <button class="btn btn-primary" onclick="openModal()">
                    <i class="fas fa-plus"></i> Add Subscription
                </button>
            </div>
        `;
        return;
    }

    subscriptionsList.innerHTML = subscriptionsToRender.map(subscription => `
        <div class="subscription-card">
            <div class="subscription-header">
                <div>
                    <div class="subscription-name">${escapeHtml(subscription.name)}</div>
                    <div class="subscription-category">${escapeHtml(subscription.category || 'Other')}</div>
                </div>
                <div class="subscription-cost">$${subscription.cost.toFixed(2)}</div>
            </div>
            
            <div class="subscription-details">
                <div class="detail-row">
                    <span class="detail-label">Billing Cycle:</span>
                    <span class="detail-value">${capitalizeFirst(subscription.billingCycle)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Next Billing:</span>
                    <span class="detail-value">${formatDate(subscription.nextBillingDate)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Days Until:</span>
                    <span class="detail-value ${getDaysUntilClass(subscription.nextBillingDate)}">
                        ${getDaysUntil(subscription.nextBillingDate)}
                    </span>
                </div>
                ${subscription.description ? `
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${escapeHtml(subscription.description)}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="subscription-actions">
                ${subscription.url ? `
                    <a href="${subscription.url}" target="_blank" class="btn btn-secondary btn-sm">
                        <i class="fas fa-external-link-alt"></i> Visit
                    </a>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="editSubscription('${subscription._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSubscription('${subscription._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Filter subscriptions
function filterSubscriptions() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryFilterValue = categoryFilter.value;
    const billingCycleFilterValue = billingCycleFilter.value;

    const filtered = subscriptions.filter(subscription => {
        const matchesSearch = subscription.name.toLowerCase().includes(searchTerm) ||
                            (subscription.description && subscription.description.toLowerCase().includes(searchTerm)) ||
                            (subscription.category && subscription.category.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !categoryFilterValue || subscription.category === categoryFilterValue;
        const matchesBillingCycle = !billingCycleFilterValue || subscription.billingCycle === billingCycleFilterValue;

        return matchesSearch && matchesCategory && matchesBillingCycle;
    });

    renderSubscriptions(filtered);
}

// Update category filter options
function updateCategoryFilter() {
    const categories = [...new Set(subscriptions.map(s => s.category).filter(Boolean))];
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    categoryFilter.value = currentValue;
}

// Open modal for adding new subscription
function openModal() {
    editingId = null;
    modalTitle.textContent = 'Add New Subscription';
    subscriptionForm.reset();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('nextBillingDate').value = today;
    
    subscriptionModal.style.display = 'block';
}

// Open modal for editing subscription
async function editSubscription(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch subscription');
        
        const subscription = await response.json();
        editingId = id;
        modalTitle.textContent = 'Edit Subscription';
        
        // Populate form
        document.getElementById('name').value = subscription.name;
        document.getElementById('cost').value = subscription.cost;
        document.getElementById('billingCycle').value = subscription.billingCycle;
        document.getElementById('nextBillingDate').value = subscription.nextBillingDate.split('T')[0];
        document.getElementById('category').value = subscription.category || '';
        document.getElementById('url').value = subscription.url || '';
        document.getElementById('description').value = subscription.description || '';
        
        subscriptionModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading subscription:', error);
        showError('Failed to load subscription details');
    }
}

// Close modal
function closeModal() {
    subscriptionModal.style.display = 'none';
    subscriptionForm.reset();
    editingId = null;
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(subscriptionForm);
    const subscriptionData = {
        name: formData.get('name'),
        cost: parseFloat(formData.get('cost')),
        billingCycle: formData.get('billingCycle'),
        nextBillingDate: formData.get('nextBillingDate'),
        category: formData.get('category') || 'Other',
        url: formData.get('url') || '',
        description: formData.get('description') || ''
    };

    try {
        const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save subscription');
        }

        closeModal();
        await loadSubscriptions();
        await loadStats();
        showSuccess(editingId ? 'Subscription updated successfully!' : 'Subscription added successfully!');
    } catch (error) {
        console.error('Error saving subscription:', error);
        showError(error.message);
    }
}

// Delete subscription
function deleteSubscription(id) {
    deleteId = id;
    confirmModal.style.display = 'block';
}

// Confirm delete
async function confirmDelete() {
    if (!deleteId) return;
    
    try {
        const response = await fetch(`${API_BASE}/${deleteId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete subscription');

        closeConfirmModal();
        await loadSubscriptions();
        await loadStats();
        showSuccess('Subscription deleted successfully!');
    } catch (error) {
        console.error('Error deleting subscription:', error);
        showError('Failed to delete subscription');
    }
}

// Close confirm modal
function closeConfirmModal() {
    confirmModal.style.display = 'none';
    deleteId = null;
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getDaysUntil(dateString) {
    const today = new Date();
    const billingDate = new Date(dateString);
    const diffTime = billingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
}

function getDaysUntilClass(dateString) {
    const today = new Date();
    const billingDate = new Date(dateString);
    const diffTime = billingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 7) return 'text-orange-600';
    if (diffDays <= 30) return 'text-yellow-600';
    return 'text-green-600';
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    subscriptionsList.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

function hideLoading() {
    // Loading will be replaced by renderSubscriptions
}

function showSuccess(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
} 
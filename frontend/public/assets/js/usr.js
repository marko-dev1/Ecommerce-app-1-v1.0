

// class AuthManager {
//     constructor() {
//         this.init();
//     }

//     init() {
//         document.addEventListener('DOMContentLoaded', () => {
//             this.checkAuthStatus();
//             this.setupEventListeners();
//         });
//     }

//     checkAuthStatus() {
//         console.log('🔐 Checking authentication status...');
        
//         const token = localStorage.getItem('authToken');
//         const userData = localStorage.getItem('userData');
        
//         console.log('📝 Token exists:', !!token);
//         console.log('📝 User data exists:', !!userData);

//         if (token && userData) {
//             try {
//                 const user = JSON.parse(userData);
//                 const userName = user.username?.trim() || user.name?.trim() || user.email;
//                 this.showAuthenticatedUI(userName);
//                 console.log('✅ User authenticated:', userName);
//             } catch (error) {
//                 console.error('❌ Error parsing user data:', error);
//                 this.showGuestUI();
//             }
//         } else {
//             console.log('❌ No authentication data found');
//             this.showGuestUI();
//         }
//     }

//     // Get authentication headers for API requests
//     getAuthHeaders() {
//         const token = localStorage.getItem('authToken');
//         return {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//         };
//     }

//     // Make authenticated API requests
//     async makeAuthenticatedRequest(url, options = {}) {
//         const headers = this.getAuthHeaders();
        
//         const config = {
//             ...options,
//             headers: {
//                 ...headers,
//                 ...options.headers
//             }
//         };

//         try {
//             const response = await fetch(url, config);
            
//             // If unauthorized, clear token and redirect to login
//             if (response.status === 401) {
//                 this.handleLogout();
//                 throw new Error('Session expired. Please login again.');
//             }
            
//             return response;
//         } catch (error) {
//             console.error('API request failed:', error);
//             throw error;
//         }
//     }

//     showAuthenticatedUI(userName) {
//         this.toggleUserElements(true, userName);
//     }

//     showGuestUI() {
//         this.toggleUserElements(false, 'Guest');
//     }

//     toggleUserElements(isAuthenticated, userName) {
//         // Desktop elements
//         const userMenu = document.getElementById('user-menu-container');
//         const loginBtn = document.getElementById('login-btn');
//         const usernameText = document.getElementById('username-text');
        
//         // Mobile elements
//         const mobileUserMenu = document.getElementById('mobile-user-menu');
//         const mobileLoginBtn = document.getElementById('mobile-login-btn');
//         const mobileUsernameText = document.getElementById('mobile-username-text');

//         if (isAuthenticated) {
//             if (userMenu) userMenu.style.display = 'block';
//             if (loginBtn) loginBtn.style.display = 'none';
//             if (usernameText) usernameText.textContent = userName;
            
//             if (mobileUserMenu) mobileUserMenu.style.display = 'block';
//             if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
//             if (mobileUsernameText) mobileUsernameText.textContent = userName;
//         } else {
//             if (userMenu) userMenu.style.display = 'none';
//             if (loginBtn) loginBtn.style.display = 'inline-block';
//             if (usernameText) usernameText.textContent = 'Guest';
            
//             if (mobileUserMenu) mobileUserMenu.style.display = 'none';
//             if (mobileLoginBtn) mobileLoginBtn.style.display = 'inline-block';
//             if (mobileUsernameText) mobileUsernameText.textContent = 'Guest';
//         }
//     }

//     setupEventListeners() {
//         document.querySelectorAll('.logout-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 this.handleLogout();
//             });
//         });

//         document.addEventListener('click', (e) => {
//             if (!e.target.closest('.user-menu-container')) {
//                 this.closeAllDropdowns();
//             }
//         });

//         const mobileUsername = document.getElementById('mobile-username-text');
//         if (mobileUsername) {
//             mobileUsername.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 this.toggleMobileDropdown();
//             });
//         }
//     }

//     handleLogout() {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('userData');
        
//         console.log('✅ User logged out');
        
//         this.showGuestUI();
//         this.showMessage('Successfully logged out', 'success');
//         this.closeAllDropdowns();
        
//         if (!this.isOnHomePage()) {
//             setTimeout(() => {
//                 window.location.href = 'index.html';
//             }, 1000);
//         }
//     }

//     toggleMobileDropdown() {
//         const dropdown = document.querySelector('.mobile-user-menu .user-dropdown');
//         if (dropdown) {
//             const isVisible = dropdown.style.display === 'block';
//             dropdown.style.display = isVisible ? 'none' : 'block';
//         }
//     }

//     closeAllDropdowns() {
//         document.querySelectorAll('.user-dropdown').forEach(dropdown => {
//             dropdown.style.display = 'none';
//         });
//     }

//     isOnHomePage() {
//         return window.location.pathname.includes('index.html') || 
//                window.location.pathname === '/';
//     }

//     showMessage(message, type = 'info') {
//         if (typeof Toastify === 'object') {
//             Toastify({
//                 text: message,
//                 duration: 3000,
//                 gravity: "top",
//                 position: "right",
//                 backgroundColor: type === 'success' ? "#28a745" : 
//                               type === 'error' ? "#dc3545" : "#007bff",
//             }).showToast();
//         } else {
//             console.log(`${type.toUpperCase()}: ${message}`);
//         }
//     }
// }

// // Initialize the authentication manager
// const authManager = new AuthManager();


class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuthStatus();
            this.setupEventListeners();
            this.loadUserOrders(); // Automatically load user orders on page load
        });
    }

    checkAuthStatus() {
        console.log('🔐 Checking authentication status...');
        
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        console.log('📝 Token exists:', !!token);
        console.log('📝 User data exists:', !!userData);

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                const userName = user.username?.trim() || user.name?.trim() || user.email;
                this.showAuthenticatedUI(userName);
                console.log('✅ User authenticated:', userName);
                
                // Store user data for easy access
                this.currentUser = user;
                
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                this.showGuestUI();
            }
        } else {
            console.log('❌ No authentication data found');
            this.showGuestUI();
        }
    }

    // Get authentication headers for API requests
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Make authenticated API requests
    async makeAuthenticatedRequest(url, options = {}) {
        const headers = this.getAuthHeaders();
        
        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // If unauthorized, clear token and redirect to login
            if (response.status === 401) {
                this.handleLogout();
                throw new Error('Session expired. Please login again.');
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 🆕 ORDER MANAGEMENT METHODS

    // Get user's orders
    // async getUserOrders() {
    //     try {
    //         if (!this.currentUser) {
    //             console.log('❌ No user data available');
    //             return [];
    //         }

    //         console.log('📦 Fetching user orders...');
    //         const response = await this.makeAuthenticatedRequest(`/api/orders/user/${this.currentUser.id}`);

    //         // const response = await this.makeAuthenticatedRequest(`/api/orders/${orderId}`);

    //         const data = await response.json();

    //         if (data.success) {
    //             console.log(`✅ Found ${data.orders.length} orders`);
    //             this.displayOrders(data.orders);
    //             return data.orders;
    //         } else {
    //             throw new Error(data.message);
    //         }
    //     } catch (error) {
    //         console.error('❌ Error fetching user orders:', error);
    //         this.showMessage('Failed to load orders', 'error');
    //         return [];
    //     }
    // }


    async getUserOrders() {
    try {
        const user = this.currentUser || JSON.parse(localStorage.getItem('userData'));
        const token = this.currentToken || localStorage.getItem('authToken');

        if (!user) {
            console.log('❌ No user data available');
            this.showMessage('User not logged in', 'error');
            return [];
        }

        if (!token) {
            console.log('❌ No token available');
            this.showMessage('No token found. Please log in again.', 'error');
            return [];
        }

        console.log(`📦 Fetching orders for user: ${user.username}`);

        const response = await fetch(`/api/orders/user/${user.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            console.log(`✅ Found ${data.orders.length} orders`);
            this.displayOrders(data.orders);
            return data.orders;
        } else {
            throw new Error(data.message || 'Failed to fetch orders');
        }

    } catch (error) {
        console.error('❌ Error fetching user orders:', error);
        this.showMessage('Failed to load orders', 'error');
        return [];
    }
}


    // Create new order
    async createOrder(orderData) {
        try {
            console.log('🛒 Creating new order...', orderData);
            
            const response = await this.makeAuthenticatedRequest('/api/orders/checkout', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage('Order placed successfully!', 'success');
                console.log('✅ Order created:', data.orderId);
                return data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Error creating order:', error);
            this.showMessage('Failed to place order: ' + error.message, 'error');
            throw error;
        }
    }

    // Get specific order details
    async getOrderDetails(orderId) {
        try {
            console.log(`📋 Fetching order details for: ${orderId}`);
            const response = await this.makeAuthenticatedRequest(`/api/orders/${orderId}`);
                            
            const data = await response.json();

            if (data.success) {
                return data.order;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('❌ Error fetching order details:', error);
            this.showMessage('Failed to load order details', 'error');
            throw error;
        }
    }

    // Display orders in the UI
    displayOrders(orders) {
        const ordersContainer = document.getElementById('user-orders-container');
        const ordersList = document.getElementById('orders-list');
        const emptyOrdersMessage = document.getElementById('empty-orders-message');

        if (!ordersContainer) return;

        if (orders.length === 0) {
            if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'block';
            if (ordersList) ordersList.style.display = 'none';
            return;
        }

        if (emptyOrdersMessage) emptyOrdersMessage.style.display = 'none';
        if (ordersList) ordersList.style.display = 'block';

        // Update orders list if element exists
        if (ordersList) {
            ordersList.innerHTML = orders.map(order => `
                <div class="order-item" data-order-id="${order.id}">
                    <div class="order-header">
                        <h4>Order #${order.id}</h4>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                        <p><strong>Items:</strong> ${order.items ? order.items.length : 0}</p>
                    </div>
                    <div class="order-actions">
                        <button class="btn-view-order" onclick="authManager.viewOrder(${order.id})">
                            View Details
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update orders count in user menu
        this.updateOrdersCount(orders.length);
    }

    // Update orders count in UI
    updateOrdersCount(count) {
        const ordersCountElements = document.querySelectorAll('.orders-count');
        ordersCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });
    }

    // View order details
    async viewOrder(orderId) {
        try {
            const order = await this.getOrderDetails(orderId);
            
            // Show order in modal or redirect to order details page
            this.showOrderModal(order);
        } catch (error) {
            console.error('Error viewing order:', error);
        }
    }

    // Show order details modal
    showOrderModal(order) {
        // Create or show modal with order details
        const modal = document.getElementById('order-details-modal') || this.createOrderModal();
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Order #${order.id}</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-info">
                        <p><strong>Status:</strong> <span class="status-${order.status}">${order.status}</span></p>
                        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                        <p><strong>Total Amount:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
                        <p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
                    </div>
                    
                    <div class="order-items">
                        <h4>Order Items (${order.items.length})</h4>
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <span class="item-name">${item.product_name}</span>
                                <span class="item-quantity">Qty: ${item.quantity}</span>
                                <span class="item-price">$${parseFloat(item.price).toFixed(2)}</span>
                                <span class="item-total">$${parseFloat(item.item_total || item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        
        // Close modal event
        modal.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };
    }

    // Create order modal element
    createOrderModal() {
        const modal = document.createElement('div');
        modal.id = 'order-details-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
        return modal;
    }

    // Load user orders automatically
    async loadUserOrders() {
        if (this.currentUser) {
            await this.getUserOrders();
        }
    }

    // 🆕 Checkout helper method
    async processCheckout(cartItems, totalAmount, shippingInfo) {
        try {
            const orderData = {
                total_amount: totalAmount,
                shipping_address: shippingInfo.address,
                customer_phone: shippingInfo.phone,
                payment_method: shippingInfo.paymentMethod || 'standard_checkout',
                cart_items: cartItems
            };

            const result = await this.createOrder(orderData);
            
            if (result.success) {
                // Clear cart after successful order
                this.clearCart();
                
                // Redirect to order confirmation
                setTimeout(() => {
                    window.location.href = `order-confirmation.html?orderId=${result.orderId}`;
                }, 1500);
            }
            
            return result;
        } catch (error) {
            console.error('Checkout process failed:', error);
            throw error;
        }
    }

    // Clear cart after successful order
    clearCart() {
        // Implement cart clearing logic based on your cart system
        if (typeof window.clearCart === 'function') {
            window.clearCart();
        }
        localStorage.removeItem('cartItems');
    }

    showAuthenticatedUI(userName) {
        this.toggleUserElements(true, userName);
        
        // Load user orders when UI updates
        setTimeout(() => this.loadUserOrders(), 500);
    }

    showGuestUI() {
        this.toggleUserElements(false, 'Guest');
        
        // Clear orders display for guests
        const ordersContainer = document.getElementById('user-orders-container');
        if (ordersContainer) {
            ordersContainer.innerHTML = '<p>Please log in to view your orders.</p>';
        }
    }

    toggleUserElements(isAuthenticated, userName) {
        // Desktop elements
        const userMenu = document.getElementById('user-menu-container');
        const loginBtn = document.getElementById('login-btn');
        const usernameText = document.getElementById('username-text');
        
        // Mobile elements
        const mobileUserMenu = document.getElementById('mobile-user-menu');
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileUsernameText = document.getElementById('mobile-username-text');

        if (isAuthenticated) {
            if (userMenu) userMenu.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (usernameText) usernameText.textContent = userName;
            
            if (mobileUserMenu) mobileUserMenu.style.display = 'block';
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
            if (mobileUsernameText) mobileUsernameText.textContent = userName;
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (usernameText) usernameText.textContent = 'Guest';
            
            if (mobileUserMenu) mobileUserMenu.style.display = 'none';
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'inline-block';
            if (mobileUsernameText) mobileUsernameText.textContent = 'Guest';
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });

        // View orders button
        document.querySelectorAll('.view-orders-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadUserOrders();
                // Navigate to orders page or show orders section
                window.location.href = '/api/orders';
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu-container')) {
                this.closeAllDropdowns();
            }
        });

        const mobileUsername = document.getElementById('mobile-username-text');
        if (mobileUsername) {
            mobileUsername.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileDropdown();
            });
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.currentUser = null;
        
        console.log('✅ User logged out');
        
        this.showGuestUI();
        this.showMessage('Successfully logged out', 'success');
        this.closeAllDropdowns();
        
        if (!this.isOnHomePage()) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 10000);
        }
    }

    toggleMobileDropdown() {
        const dropdown = document.querySelector('.mobile-user-menu .user-dropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display === 'block';
            dropdown.style.display = isVisible ? 'none' : 'block';
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.user-dropdown').forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    }

    isOnHomePage() {
        return window.location.pathname.includes('index.html') || 
               window.location.pathname === '/';
    }

    showMessage(message, type = 'info') {
        if (typeof Toastify === 'object') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: type === 'success' ? "#28a745" : 
                              type === 'error' ? "#dc3545" : "#007bff",
            }).showToast();
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the authentication manager
const authManager = new AuthManager();

// Global functions for easy access from HTML
window.viewOrder = (orderId) => authManager.viewOrder(orderId);
window.loadUserOrders = () => authManager.loadUserOrders();
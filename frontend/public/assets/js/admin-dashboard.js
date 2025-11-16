    let currentUser = null;
        let editingProductId = null;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            checkAuth();
            setupEventListeners();
        });

        function checkAuth() {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                window.location.href = 'admin-login.html';
                return;
            }
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                currentUser = payload;
                document.getElementById('adminName').textContent = payload.username;
                
                // Show admin management sections only for super admin
                if (payload.role === 'super_admin') {
                    document.getElementById('adminsSection').style.display = 'block';
                    document.getElementById('addAdminSection').style.display = 'block';
                }
            } catch (error) {
                console.error('Invalid token:', error);
                logout();
            }
        }

        function setupEventListeners() {
            // Sidebar menu
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                if (item.dataset.section) {
                    item.addEventListener('click', () => switchSection(item.dataset.section));
                }
            });

            // Forms
            document.getElementById('addAdminForm').addEventListener('submit', handleAddAdmin);
            document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

            // Load initial data
            loadDashboardStats();
            loadProducts();
            loadOrders();
            loadUsers();
            
            if (currentUser?.role === 'super_admin') {
                loadAdmins();
            }
        }

        function switchSection(sectionName) {
            // Update active menu item
            document.querySelectorAll('.sidebar-menu li').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

            // Show selected section
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionName).classList.add('active');

            // Refresh section data
            switch(sectionName) {
                case 'products':
                    loadProducts();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'admins':
                    loadAdmins();
                    break;
                case 'dashboard':
                    loadDashboardStats();
                    break;
            }
        }

        // Enhanced API Call function
        async function apiCall(url, options = {}) {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                console.error('❌ No adminToken found');
                logout();
                throw new Error('No authentication token found');
            }

            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            // Remove Content-Type for FormData
            if (options.body instanceof FormData) {
                delete defaultOptions.headers['Content-Type'];
            }

            console.log(`🔄 API Call: ${url}`);

            try {
                const response = await fetch(url, { ...defaultOptions, ...options });
                
                console.log(`📡 Response: ${response.status} for ${url}`);
                
                if (response.status === 401) {
                    console.error('❌ 401 Unauthorized');
                    logout();
                    throw new Error('Authentication failed');
                }
                
                if (response.status === 404) {
                    console.error(`❌ 404 Not Found: ${url}`);
                    throw new Error(`API endpoint not found: ${url}`);
                }
                
                const responseText = await response.text();
                let responseData;
                
                try {
                    responseData = responseText ? JSON.parse(responseText) : {};
                } catch {
                    responseData = { message: responseText || 'Invalid JSON' };
                }
                
                if (!response.ok) {
                    throw new Error(responseData.message || responseData.error || `Request failed: ${response.status}`);
                }
                
                return responseData;
            } catch (error) {
                console.error(`❌ API Call failed for ${url}:`, error);
                throw error;
            }
        }

        // Dashboard Stats
        async function loadDashboardStats() {
            try {
                console.log('🔄 Loading dashboard stats...');
                
                // Load products
                const products = await apiCall('/api/products');
                const productsCount = Array.isArray(products) ? products.length : 0;
                document.getElementById('totalProducts').textContent = productsCount;

                // Load users
                try {
                    const users = await apiCall('/api/users');
                    const usersCount = Array.isArray(users) ? users.length : 0;
                    document.getElementById('totalUsers').textContent = usersCount;
                } catch (error) {
                    console.warn('⚠️ Could not load users:', error.message);
                    document.getElementById('totalUsers').textContent = '0';
                }

                // Load orders
                // const orders = await apiCall('/api/orders');
                // const ordersCount = Array.isArray(orders) ? orders.length : 0;
                // document.getElementById('totalOrders').textContent = ordersCount;
                
                // Calculate pending orders
                const orders = await apiCall('/api/orders');
                const pendingOrdersCount = Array.isArray(orders) ? 
                    orders.filter(order => order.status === 'pending').length : 0;
                document.getElementById('pendingOrders').textContent = pendingOrdersCount;

                // Load admins
                if (currentUser?.role === 'super_admin') {
                    try {
                        const admins = await apiCall('/api/users/admins');
                        const adminsCount = Array.isArray(admins) ? admins.length : 0;
                        document.getElementById('totalAdmins').textContent = adminsCount;
                    } catch (error) {
                        console.warn('⚠️ Could not load admins:', error.message);
                        document.getElementById('totalAdmins').textContent = '0';
                    }
                }

                console.log('✅ Dashboard stats loaded');
            } catch (error) {
                console.error('❌ Error loading dashboard stats:', error);
                setDefaultStats();
            }
        }

        function setDefaultStats() {
            document.getElementById('totalUsers').textContent = '0';
            document.getElementById('totalProducts').textContent = '0';
            // document.getElementById('totalOrders').textContent = '0';
            document.getElementById('pendingOrders').textContent = '0';
            document.getElementById('totalAdmins').textContent = '0';
        }

        // Products Management
        async function loadProducts() {
            try {
                const products = await apiCall('/api/products');
                displayProducts(products);
            } catch (error) {
                console.error('Error loading products:', error);
                showNotification('Error loading products: ' + error.message, 'error');
            }
        }

        function displayProducts(products) {
            const productsList = document.getElementById('productsList');
            
            if (!Array.isArray(products)) {
                console.warn('Products is not an array');
                products = [];
            }
            
            if (products.length === 0) {
                productsList.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                            <h3>No products found</h3>
                            <p>There are no products in the system yet.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            productsList.innerHTML = products.map(product => `
                <tr>
                    <td>
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name}" class="product-image">` : 
                            '<div style="width:50px;height:50px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">No Image</div>'
                        }
                    </td>
                    <td>${product.name}</td>
                    <td>Ksh ${parseFloat(product.price || 0).toFixed(2)}</td>
                    <td>${product.stock || 0}</td>
                    <td>${product.category || '-'}</td>
                    <td>
                        <button class="btn btn-warning" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }


async function loadOrders() {
    try {
        const token = localStorage.getItem('adminToken') || ('authToken');
        const response = await fetch('http://localhost:3000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        console.log('Fetched orders:', result);

        if (result.success && Array.isArray(result.data)) {
            const orders = result.data;
            console.log('✅ Passing orders to displayOrders:', orders);
            displayOrders(orders);

            // 🧮 Update order count
            const orderCountElement = document.getElementById('totalOrders');
            if (orderCountElement) {
                orderCountElement.textContent = orders.length;
            }
        } else {
            displayOrders([]);
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
    }
}



function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (!Array.isArray(orders)) {
        console.warn('Orders is not an array');
        orders = [];
    }
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <h3>No orders found</h3>
                    <p>There are no orders in the system yet.</p>
                </td>
            </tr>
        `;
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <tr>
            <td><strong>#${order.id || 'N/A'}</strong></td>
           <td>
  <div>${order.username || order.customer_Name || 'Customer'}</div>
  <small style="color: #666;">${order.customer_phone || order.email || 'No contact'}</small>
</td>

            <td>Ksh ${parseFloat(order.total_amount || 0).toFixed(2)}</td>
            <td>
                <select onchange="updateOrderStatus(${order.id}, this.value)" class="form-control">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</td>
            <td>
               <button class="btn btn-primary" onclick="viewOrderDetails(${order.id})">View Details</button>


            </td>
        </tr>
    `).join('');
}

// ✅ Run it after page loads
document.addEventListener('DOMContentLoaded', loadOrders);

        // Users Management
        async function loadUsers() {
            try {
                console.log('🔄 Loading users...');
                const users = await apiCall('/api/users');
                displayUsers(users);
            } catch (error) {
                console.error('Error loading users:', error);
                showNotification('Error loading users: ' + error.message, 'error');
                displayUsers([]);
            }
        }

        function displayUsers(users) {
            const usersList = document.getElementById('usersList');
            
            if (!Array.isArray(users)) {
                console.warn('Users is not an array');
                users = [];
            }
            
            if (users.length === 0) {
                usersList.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                            <h3>No users found</h3>
                            <p>There are no users in the system yet.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            usersList.innerHTML = users.map(user => `
                <tr>
                    <td>${user.username || 'Unknown'}</td>
                    <td>${user.email || 'No email'}</td>
                    <td>${user.phone_number || 'No phone'}</td>

                    <td>${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        // Admins Management
        async function loadAdmins() {
            try {
                const admins = await apiCall('/api/users/admins');
                displayAdmins(admins);
            } catch (error) {
                console.error('Error loading admins:', error);
                showNotification('Error loading admins: ' + error.message, 'error');
            }
        }

        function displayAdmins(admins) {
            const adminsList = document.getElementById('adminsList');
            
            if (!Array.isArray(admins)) {
                console.warn('Admins is not an array');
                admins = [];
            }
            
            if (admins.length === 0) {
                adminsList.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                            <h3>No admins found</h3>
                            <p>There are no additional admins in the system.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            adminsList.innerHTML = admins.map(admin => `
                <tr>
                    <td>${admin.username}</td>
                    <td>${admin.email}</td>
                    <td>${admin.role}</td>
                    <td>${new Date(admin.created_at).toLocaleDateString()}</td>
                    <td>
                        ${admin.role !== 'super_admin' ? `
                            <button class="btn btn-danger" onclick="deleteAdmin(${admin.id})">Delete</button>
                        ` : '<span style="color: #999;">Protected</span>'}
                    </td>
                </tr>
            `).join('');
        }

        // Product Modal Functions
        function showAddProductModal() {
            editingProductId = null;
            document.getElementById('productModalTitle').textContent = 'Add Product';
            document.getElementById('productForm').reset();
            document.getElementById('productModal').style.display = 'block';
        }

        function closeProductModal() {
            document.getElementById('productModal').style.display = 'none';
            editingProductId = null;
        }

        async function editProduct(productId) {
            try {
                const product = await apiCall(`/api/products/${productId}`);
                
                editingProductId = productId;
                document.getElementById('productModalTitle').textContent = 'Edit Product';
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productCategory').value = product.category || '';
                document.getElementById('productModal').style.display = 'block';
            } catch (error) {
                console.error('Error loading product for edit:', error);
                showNotification('Error loading product details', 'error');
            }
        }

        async function handleProductSubmit(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData();
                formData.append('name', document.getElementById('productName').value);
                formData.append('description', document.getElementById('productDescription').value);
                formData.append('price', document.getElementById('productPrice').value);
                formData.append('stock', document.getElementById('productStock').value);
                formData.append('category', document.getElementById('productCategory').value);
                
                const imageFile = document.getElementById('productImage').files[0];
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
                const method = editingProductId ? 'PUT' : 'POST';

                await apiCall(url, {
                    method: method,
                    body: formData
                });

                closeProductModal();
                loadProducts();
                loadDashboardStats();
                showNotification(
                    editingProductId ? 'Product updated successfully' : 'Product added successfully', 
                    'success'
                );
            } catch (error) {
                console.error('Error saving product:', error);
                showNotification('Error saving product: ' + error.message, 'error');
            }
        }

        async function deleteProduct(productId) {
            if (!confirm('Are you sure you want to delete this product?')) return;
            
            try {
                await apiCall(`/api/products/${productId}`, { method: 'DELETE' });
                loadProducts();
                loadDashboardStats();
                showNotification('Product deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Error deleting product', 'error');
            }
        }

        // Order Management
        async function updateOrderStatus(orderId, status) {
            try {
                await apiCall(`/api/orders/${orderId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                showNotification('Order status updated successfully', 'success');
            } catch (error) {
                console.error('Error updating order status:', error);
                showNotification('Error updating order status: ' + error.message, 'error');
                loadOrders();
            }
        }


// Improved modal creation with better styling and functionality
function ensureModalExists() {
    if (document.getElementById('orderDetailsModal')) {
        return true;
    }
    
    const modalHTML = `
        <div id="orderDetailsModal" class="order-modal">
            <div class="order-modal-overlay" onclick="closeOrderModal()"></div>
            <div class="order-modal-content">
                <div class="order-modal-header">
                    <h2 class="order-modal-title">
                        <i class="order-modal-icon">📦</i>
                        Order Details
                    </h2>
                    <button class="order-modal-close" onclick="closeOrderModal()" aria-label="Close modal">
                        &times;
                    </button>
                </div>
                <div class="order-modal-body">
                    <div id="orderDetailsContent" class="order-details-content">
                        <div class="loading-state">
                            <div class="loading-spinner"></div>
                            <p>Loading order details...</p>
                        </div>
                    </div>
                </div>
                <div class="order-modal-footer">
                    <button class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
                </div>
            </div>
        </div>
        <style>
            .order-modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .order-modal-overlay {
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
            }
            
            .order-modal-content {
                position: relative;
                background: #fff;
                margin: 2rem auto;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease-out;
                overflow: hidden;
            }
            
            .order-modal-header {
                display: flex;
                justify-content: between;
                align-items: center;
                padding: 1.5rem 1.5rem 1rem;
                border-bottom: 1px solid #e9ecef;
            }
            
            .order-modal-title {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
                color: #2d3748;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .order-modal-icon {
                font-size: 1.5rem;
            }
            
            .order-modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                color: #6b7280;
                transition: all 0.2s ease;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .order-modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .order-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 0 1.5rem;
            }
            
            .order-modal-footer {
                padding: 1rem 1.5rem 1.5rem;
                border-top: 1px solid #e9ecef;
                display: flex;
                justify-content: flex-end;
            }
            
            .order-details-content {
                padding: 1rem 0;
            }
            
            .loading-state {
                text-align: center;
                padding: 2rem;
                color: #6b7280;
            }
            
            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #e5e7eb;
                border-top: 3px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            
            .error-state {
                text-align: center;
                padding: 2rem;
                color: #dc2626;
            }
            
            .error-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .order-summary {
                background: #f8fafc;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }
            
            .order-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .order-info-item {
                display: flex;
                flex-direction: column;
            }
            
            .order-info-label {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }
            
            .order-info-value {
                font-weight: 500;
                color: #374151;
            }
            
            .status-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            
            .order-items-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .order-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .order-item:last-child {
                border-bottom: none;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-name {
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.25rem;
            }
            
            .item-meta {
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .item-price {
                font-weight: 600;
                color: #059669;
            }
            
            .order-total {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 0;
                border-top: 2px solid #e5e7eb;
                font-weight: 600;
                font-size: 1.125rem;
                color: #1f2937;
            }
            
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }
            
            .btn-secondary {
                background: #6b7280;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #4b5563;
            }
            
            @keyframes modalSlideIn {
                from { 
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @media (max-width: 640px) {
                .order-modal-content {
                    margin: 0;
                    width: 100%;
                    height: 100%;
                    max-height: 100%;
                    border-radius: 0;
                }
                
                .order-info-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeOrderModal();
        }
    });
    
    return true;
}

// Enhanced order details function with better error handling
async function viewOrderDetails(orderId) {
    console.log('=== 🧾 viewOrderDetails Debug ===');
    console.log('Raw input orderId:', orderId, '| Type:', typeof orderId);

    // Enhanced validation
    if (!orderId || ['undefined', 'null', ''].includes(String(orderId).trim())) {
        console.error('❌ Invalid orderId:', orderId);
        showError('Invalid order ID provided');
        return;
    }

    // Normalize order ID
    let processedOrderId = orderId;
    if (typeof orderId === 'string') {
        const numericId = orderId.replace(/\D/g, '');
        if (numericId && !isNaN(numericId)) {
            processedOrderId = parseInt(numericId);
        } else {
            console.error('❌ No numeric ID found in:', orderId);
            showError('Invalid order ID format');
            return;
        }
    }

    console.log('Processed orderId:', processedOrderId, '| Type:', typeof processedOrderId);

    // Ensure modal exists and show loading state
    ensureModalExists();
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');

    modal.style.display = 'block';
    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading order details...</p>
        </div>
    `;

    const token = getToken();

    if (!token) {
        showAuthenticationError();
        return;
    }

    try {
        const response = await fetch(`/api/orders/${processedOrderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        console.log('API Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Order not found'}`);
        }

        const data = await response.json();
        console.log('✅ Order data received:', data);

        // Display the order details
        displayOrderDetails(data.data || data);
        
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        showOrderFetchError(processedOrderId, error);
    }
}

// Enhanced order details display
function displayOrderDetails(order) {
    const content = document.getElementById('orderDetailsContent');

    if (!content) {
        console.error('❌ Missing element: #orderDetailsContent');
        return;
    }

    const orderId = order.id || 'Unknown';
    const status = order.status || 'Unknown';
    const orderDate = order.created_at || order.orderDate || order.date || null;
    const total = parseFloat(order.total_amount || order.total || 0);
    const items = order.items || [];
    const customerName = order.customer_name || order.customer?.name || 'No';
    const customerEmail = order.customer_email || order.customer?.email || 'N/A';

    // Get status badge class
    const statusClass = `status-${status.toLowerCase()}`;

    let html = `
        <div class="order-summary">
            <div class="order-info-grid">
                <div class="order-info-item">
                    <span class="order-info-label">Order Number</span>
                    <span class="order-info-value">#${orderId}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Status</span>
                    <span class="order-info-value">
                        <span class="status-badge ${statusClass}">${status}</span>
                    </span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Order Date</span>
                    <span class="order-info-value">${formatDate(orderDate)}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Customer</span>
                    <span class="order-info-value">${escapeHtml(customerName)}</span>
                </div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 1rem; color: #374151;">Order Items</h3>
    `;

    if (items.length > 0) {
        html += `
            <ul class="order-items-list">
                ${items.map(item => `
                    <li class="order-item">
                        <div class="item-details">
                            <div class="item-name">${escapeHtml(item.name || item.product_name || 'Unnamed Item')}</div>
                            <div class="item-meta">Quantity: ${item.quantity || 1}</div>
                        </div>
                        <div class="item-price">
                            Ksh ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                    </li>
                `).join('')}
            </ul>
            <div class="order-total">
                <span>Total Amount:</span>
                <span>Ksh ${total.toFixed(2)}</span>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <p>No items found for this order.</p>
            </div>
        `;
    }

    content.innerHTML = html;
}

// Enhanced close modal function
function closeOrderModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset scroll position
        const content = modal.querySelector('.order-modal-body');
        if (content) content.scrollTop = 0;
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Invalid date';
    }
}

function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Enhanced error display functions
function showError(message) {
    alert(`Error: ${message}`);
}

function showAuthenticationError() {
    const content = document.getElementById('orderDetailsContent');
    if (content) {
        content.innerHTML = `
            <div class="error-state">
                <div class="error-icon">🔒</div>
                <h3>Authentication Required</h3>
                <p>Please log in to view order details.</p>
                <button class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
            </div>
        `;
    }
}

function showOrderFetchError(orderId, error) {
    const content = document.getElementById('orderDetailsContent');
    if (content) {
        content.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Order Not Found</h3>
                <p>Could not find order #${orderId}</p>
                <p style="font-size: 0.875rem; opacity: 0.7;">Error: ${escapeHtml(error.message)}</p>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="btn btn-secondary" onclick="closeOrderModal()">Close</button>
                    <button class="btn btn-secondary" onclick="debugOrder(${orderId})">Debug</button>
                </div>
            </div>
        `;
    }
}

// Simple function to get the token (unchanged)
function getToken() {
    return localStorage.getItem('token') || 
           localStorage.getItem('adminToken') || 
           (window.token ? window.token : null);
}

        // User Management
        async function deleteUser(userId) {
            if (!confirm('Are you sure you want to delete this user?')) return;
            
            try {
                await apiCall(`/api/users/${userId}`, { method: 'DELETE' });
                loadUsers();
                loadDashboardStats();
                showNotification('User deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting user:', error);
                showNotification('Error deleting user', 'error');
            }
        }

        // Admin Management
        async function handleAddAdmin(e) {
            e.preventDefault();
            
            try {
                const formData = {
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };

                await apiCall('/api/users/admins', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });

                document.getElementById('addAdminForm').reset();
                loadAdmins();
                loadDashboardStats();
                showNotification('Admin created successfully', 'success');
                switchSection('admins');
            } catch (error) {
                console.error('Error creating admin:', error);
                showNotification('Error creating admin: ' + error.message, 'error');
            }
        }

        async function deleteAdmin(adminId) {
            if (!confirm('Are you sure you want to delete this admin?')) return;
            
            try {
                await apiCall(`/api/users/admins/${adminId}`, { method: 'DELETE' });
                loadAdmins();
                loadDashboardStats();
                showNotification('Admin deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting admin:', error);
                showNotification('Error deleting admin', 'error');
            }
        }

        // Utility Functions
        function showNotification(message, type = 'info') {
            document.querySelectorAll('.notification').forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${getNotificationColor(type)};
                color: white;
                border-radius: 4px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        function getNotificationColor(type) {
            const colors = {
                success: '#27ae60',
                error: '#e74c3c',
                warning: '#f39c12',
                info: '#3498db'
            };
            return colors[type] || colors.info;
        }

        function logout() {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        }

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
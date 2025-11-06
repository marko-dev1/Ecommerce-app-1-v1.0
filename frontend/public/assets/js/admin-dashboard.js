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
        const token = localStorage.getItem('adminToken');
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
                <button class="btn btn-primary" onclick="viewOrderDetails(${order.id})">View</button>
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

        function viewOrderDetails(orderId) {
            alert(`Order #${orderId} details:\n\nThis would show detailed order information in a real application.`);
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
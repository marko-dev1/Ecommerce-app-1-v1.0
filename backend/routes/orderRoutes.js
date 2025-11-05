
// module.exports = router;
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// 🧾 Admin routes
router.get('/', auth, adminAuth, orderController.getAllOrders);
router.get('/:id', auth, adminAuth, orderController.getOrder);
router.put('/:id/status', auth, adminAuth, orderController.updateOrderStatus);
router.delete('/:id', auth, adminAuth, orderController.deleteOrder);

// 🛒 Customer routes
router.post('/', auth, orderController.createOrder);
router.get('/user/:userId', auth, orderController.getUserOrders);



// routes/orderRoutes.js


const db = require('../config/database');

// POST /api/orders/checkout - Create new order
router.post('/checkout', async (req, res) => {
    let connection;
    try {
        const { 
            user_id, 
            total_amount, 
            shipping_address, 
            payment_method, 
            customer_phone, 
            cart_items 
        } = req.body;

        console.log('📦 Received order checkout request:', {
            user_id,
            total_amount,
            customer_phone,
            item_count: cart_items ? cart_items.length : 0
        });

        // Validate required fields
        if (!total_amount || !shipping_address || !customer_phone || !cart_items) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['total_amount', 'shipping_address', 'customer_phone', 'cart_items'],
                received: {
                    total_amount: !!total_amount,
                    shipping_address: !!shipping_address,
                    customer_phone: !!customer_phone,
                    cart_items: cart_items ? cart_items.length : 0
                }
            });
        }

        // Validate cart items
        if (!Array.isArray(cart_items) || cart_items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart items must be a non-empty array'
            });
        }

        // Get connection from pool
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (
                    user_id, 
                    total_amount, 
                    shipping_address, 
                    payment_method, 
                    customer_phone
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    user_id || null,
                    parseFloat(total_amount),
                    shipping_address,
                    payment_method || 'standard_checkout',
                    customer_phone
                ]
            );

            const orderId = orderResult.insertId;
            console.log(`✅ Order created with ID: ${orderId}`);

            // Insert order items - using your exact table structure
            let insertedItems = 0;
            for (const item of cart_items) {
                await connection.execute(
                    `INSERT INTO order_items (
                        order_id, 
                        product_id, 
                        product_name, 
                        price, 
                        quantity
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        orderId,
                        item.id || null,
                        item.name || 'Unknown Product',
                        parseFloat(item.price) || 0,
                        parseInt(item.quantity) || 1
                    ]
                );
                insertedItems++;
                console.log(`   📝 Added item: ${item.name} (Qty: ${item.quantity}, Price: ${item.price})`);
            }

            await connection.commit();
            console.log(`✅ ${insertedItems} order items inserted for order ${orderId}`);

            res.json({
                success: true,
                orderId: orderId,
                message: 'Order created successfully',
                orderNumber: `ORD-${orderId}`,
                totalAmount: total_amount,
                itemCount: insertedItems
            });

        } catch (dbError) {
            await connection.rollback();
            console.error('❌ Database error:', dbError);
            throw dbError;
        }

    } catch (error) {
        console.error('❌ Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
});

// GET /api/orders - Get all orders
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all orders...');
        
        const [orders] = await db.pool.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);

        // For each order, get order items
        for (let order of orders) {
            const [items] = await db.pool.execute(`
                SELECT * FROM order_items WHERE order_id = ?
            `, [order.id]);
            order.items = items;
            
            // Calculate item totals for display
            order.items.forEach(item => {
                item.item_total = (item.price * item.quantity).toFixed(2);
            });
        }

        res.json({
            success: true,
            count: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
});

// GET /api/orders/:id - Get single order with detailed items
router.get('/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log(`📋 Fetching order ${orderId}...`);

        const [orders] = await db.pool.execute(`
            SELECT o.*, u.username, u.email 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            WHERE o.id = ?
        `, [orderId]);

        if (orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const [items] = await db.pool.execute(`
            SELECT *, (price * quantity) as item_total 
            FROM order_items 
            WHERE order_id = ?
        `, [orderId]);

        const order = orders[0];
        order.items = items;

        res.json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error('❌ Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        await db.pool.execute(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, orderId]
        );

        res.json({
            success: true,
            message: `Order status updated to ${status}`
        });

    } catch (error) {
        console.error('❌ Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});

// GET order items for a specific order
router.get('/:id/items', async (req, res) => {
    try {
        const orderId = req.params.id;
        const [items] = await db.pool.execute(`
            SELECT *, (price * quantity) as item_total 
            FROM order_items 
            WHERE order_id = ?
        `, [orderId]);

        res.json({
            success: true,
            items: items,
            count: items.length
        });

    } catch (error) {
        console.error('❌ Error fetching order items:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order items'
        });
    }
});

// Test endpoint
router.get('/test/checkout', (req, res) => {
    res.json({ 
        message: 'Order routes are working! ✅',
        endpoints: {
            'POST /checkout': 'Create new order',
            'GET /': 'Get all orders', 
            'GET /:id': 'Get single order',
            'GET /:id/items': 'Get order items',
            'PUT /:id/status': 'Update order status'
        }
    });
});

module.exports = router;
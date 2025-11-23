require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const userAdminRoutes = require('./routes/userAdminRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api', userAdminRoutes);

// Import database with error handling
let database;
try {
    database = require('./config/database');
} catch (error) {
  
    process.exit(1);
}

// Test endpoint - add this first
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is working! 🚀', 
        timestamp: new Date().toISOString(),
        endpoints: ['/api/products', '/api/users', '/api/orders', '/api/admin', '/api/profile' ]
    });
});


// Load each route individually to identify which one fails
const loadRoute = (name, path, endpoint) => {
    try {
        const route = require(path);
        app.use(endpoint, route);
       
        return true;
    } catch (error) {
        return false;
    }
};

// Load routes one by one
const routes = [
    { name: 'productRoutes', path: './routes/productRoutes', endpoint: '/api/products' },
    { name: 'userAdminRoutes', path: './routes/userAdminRoutes', endpoint: '/api/users' },
    { name: 'orderRoutes', path: './routes/orderRoutes', endpoint: '/api/orders' },
    { name: 'userAdminRoutes', path: './routes/userAdminRoutes', endpoint: '/api/admin' }
];

 const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

let loadedCount = 0;
routes.forEach(route => {
    if (loadRoute(route.name, route.path, route.endpoint)) {
        loadedCount++;
    }
});

// Serve pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/admin-dashboard.html'));
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/admin-login.html'));
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Ecommerce API Server',
        status: 'Running',
        endpoints: {
            test: '/api/test',
            health: '/api/health',
            products: '/api/products',
            users: '/api/users', 
            orders: '/api/orders',
            admin: '/admin',
            adminLogin: '/admin-login',
            login: '/api/login'
        }
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const isConnected = await database.testConnection();
        res.json({ 
            status: 'OK', 
            database: isConnected ? 'Connected' : 'Disconnected',
            timestamp: new Date().toISOString(),
            routes: {
                products: 'Available',
                users: 'Available', 
                orders: 'Available',
                admins: 'Available'
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Error', 
            database: 'Disconnected',
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found',
        requested: req.originalUrl,
        available: ['/api/test', '/api/health', '/api/products', '/api/users', '/api/orders']
    });
});


// Start server function
const startServer = async () => {
    try {
        
        // Verify testConnection exists and is a function
        if (!database.testConnection || typeof database.testConnection !== 'function') {
            throw new Error(`testConnection is not available. Available exports: ${Object.keys(database).join(', ')}`);
        }
        
        const isConnected = await database.testConnection();
        
        if (!isConnected) {
            throw new Error('Database connection failed. Please check your MySQL server and credentials.');
        }
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
        });
        
    } catch (error) {
        process.exit(1);
    }
};

// Start the server
startServer();
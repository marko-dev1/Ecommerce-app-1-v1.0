const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 Loading database configuration...');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('📋 Database config loaded');

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
const testConnection = async () => {
    console.log('🔌 Testing database connection...');
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database function
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing database...');
        await testConnection();
        await createTables();
        await createDefaultAdmin();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
};

// Create tables function
const createTables = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('🗂️ Creating tables...');

        // Users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('customer', 'admin', 'super_admin') DEFAULT 'customer',
                name VARCHAR(100),
                phone_number VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Products table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                stock INT DEFAULT 0,
                category VARCHAR(100),
                image_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Products table created');

        // Orders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                 id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                total_amount DECIMAL(10,2) NOT NULL,
                status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                shipping_address TEXT NOT NULL,
                payment_method VARCHAR(50),
                customer_phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                    )
        `);
        console.log('✅ Orders table created');

        // Order items table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                quantity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Order items table created');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Create default admin function
const createDefaultAdmin = async () => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Check if super admin already exists
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE role = ?',
            ['super_admin']
        );
        if (rows.length === 0) {
            // Create default super admin (password: admin123)
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(
                'INSERT INTO users (username, email, password, role, name) VALUES (?, ?, ?, ?, ?)',
                ['superadmin', 'admin@ecommerce.com', hashedPassword, 'super_admin', 'Super Administrator']
            );
            
            console.log('✅ Default super admin created:');
            console.log('   Username: superadmin');
            console.log('   Email: admin@ecommerce.com');
            console.log('   Password: admin123');
        } else {
            console.log('✅ Super admin already exists');
        }

    } catch (error) {
        console.error('❌ Error creating default admin:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};



// Initialize database (but don't block server startup)
initializeDatabase().catch(console.error);

console.log('✅ Database module setup complete');

// Export everything
module.exports = {
    pool,
    testConnection,
    initializeDatabase
}; 
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
    // ===============================
    // 🔐 ADMIN LOGIN
    // ===============================
    static async adminLogin(req, res) {
        try {
            const { username, password } = req.body;
            console.log('🔐 Admin login attempt:', { username });

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }

            // Try username or email
            let user = await User.findByUsername(username);
            if (!user) user = await User.findByEmail(username);
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            // ✅ Only admins and super_admins allowed
            if (!['admin', 'super_admin'].includes(user.role)) {
                return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

            // Generate token
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            console.log('✅ Admin login successful:', user.username);
            res.json({
                message: 'Admin login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name }
            });

        } catch (error) {
            console.error('❌ Admin login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }


    // ===============================
    // 👤 NORMAL USER LOGIN
    // ===============================
    static async login(req, res) {
        try {
            // const { username, password } = req.body;
            // console.log('👤 User login attempt:', { username });

            // if (!username || !password) {
            //     return res.status(400).json({ error: 'Username and password are required' });
            // }

            // // Find by username or email
            // let user = await User.findByUsername(username);
            // if (!user) user = await User.findByEmail(username);
            // if (!user) return res.status(401).json({ error: 'Invalid username or password' });
            const { username, email, password } = req.body;
const loginId = username || email;
console.log('👤 User login attempt:', { loginId });

if (!loginId || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
}

let user = await User.findByUsername(loginId);
if (!user) user = await User.findByEmail(loginId);


            // ✅ Check if user is a normal user
            // if (user.role !== 'user') {
            //     console.log('⚠️ Not a normal user (role =', user.role, ')');
            //     return res.status(403).json({ error: 'Access denied. Please use the admin login page.' });
            // }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            console.log('✅ User login successful:', user.username);
            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.name }
            });

        } catch (error) {
            console.error('❌ User login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }


    // ===============================
    // 🧪 DEBUG HASH CREATION
    // ===============================
    static async debugUserCreation(req, res) {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            res.json({
                inputPassword: password,
                hashedPassword,
                hashLength: hashedPassword.length
            });
        } catch (error) {
            res.status(500).json({ error: 'Debug failed' });
        }
    }


    // ===============================
    // 🙍‍♂️ PROFILE
    // ===============================
    static async getProfile(req, res) {
        try {
            res.json({ user: req.user });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AuthController;

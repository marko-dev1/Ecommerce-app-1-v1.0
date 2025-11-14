const jwt = require('jsonwebtoken');
const User = require('../models/user');

// const auth = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
        
//         if (!token) {
//             return res.status(401).json({ error: 'Access denied. No token provided.' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//         const user = await User.findById(decoded.userId);
        
//         if (!user) {
//             return res.status(401).json({ error: 'Invalid token.' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({ error: 'Invalid token.' });
//     }
// };


const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            console.log('❌ No Authorization header sent');
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            console.log('❌ Authorization header is malformed:', authHeader);
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        res.status(401).json({ error: 'Invalid token.' });
    }
};



const adminAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        // Check if user is either admin OR super admin
        const [isAdmin, isSuperAdmin] = await Promise.all([
            User.isAdmin(req.user.id),
            User.isSuperAdmin(req.user.id)
        ]);

        if (!isAdmin && !isSuperAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (error) {
        console.error('❌ adminAuth error:', error);
        res.status(500).json({ error: 'Server error during authorization.' });
    }
};

const superAdminAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const isSuperAdmin = await User.isSuperAdmin(req.user.id);
        if (!isSuperAdmin) {
            return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error during authorization.' });
    }
};

module.exports = { auth, adminAuth, superAdminAuth };



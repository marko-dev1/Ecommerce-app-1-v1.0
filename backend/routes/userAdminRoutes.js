
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const UserController = require('../controllers/userController');
const {auth,  superAdminAuth } = require('../middleware/auth');

// ===============================
// 🔐 AUTHENTICATION ROUTES
// ===============================

// 👤 Normal User Login
router.post('/login', AuthController.login);

// 🔐 Admin Login
router.post('/admin/login', AuthController.adminLogin);

// 👤 Register Normal User
router.post('/register', UserController.register);

// 🙍‍♂️ Get Logged-in User Profile (any authenticated user)
router.get('/profile', auth, AuthController.getProfile);


// ===============================
// 🧑‍💼 ADMIN MANAGEMENT (Super Admin only)
// ===============================

// ➕ Create Admin
router.post('/admins', auth, superAdminAuth, UserController.createAdmin);

// 📜 Get All Admins
router.get('/admins', auth, superAdminAuth, UserController.getAllAdmins);

// 🔄 Update Admin Role
router.put('/admins/:userId/role', auth, superAdminAuth, UserController.updateUserRole);

// ❌ Delete Admin
router.delete('/admins/:userId', auth, superAdminAuth, UserController.deleteAdmin);


// ===============================
// 👥 USER MANAGEMENT (Admin or Super Admin)
// ===============================

// 📋 Get All Users
router.get('/users', auth, UserController.getAllUsers);

// ✏️ Update User (Admin or Super Admin)
// router.put('/users/:userId', auth, adminAuth, UserController.updateUser);


// ===============================
// 🧪 DEBUG ROUTE (optional)
// ===============================
router.post('/debug-hash', AuthController.debugUserCreation);


module.exports = router;

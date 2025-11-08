const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const UserController = require('../controllers/userController');
const { auth, adminAuth, superAdminAuth } = require('../middleware/auth');

// Admin authentication routes
router.post('/login', (req, res) => AuthController.adminLogin(req, res));
router.get('/profile', auth, adminAuth, (req, res) => AuthController.getProfile(req, res));

// Admin management routes (super admin only)
router.post('/admins', auth, superAdminAuth, (req, res) => UserController.createAdmin(req, res));
router.get('/admins', auth, superAdminAuth, (req, res) => UserController.getAllAdmins(req, res));
router.put('/:userId/role', auth, superAdminAuth, (req, res) => UserController.updateUserRole(req, res));
router.delete('/admins/:userId', auth, superAdminAuth, (req, res) => UserController.deleteAdmin(req, res));
// Add this to your auth routes for debugging
router.post('/debug-create-hash', AuthController.debugUserCreation);
// router.get('/:orderId', auth, adminAuth, orderController.getOrder);

// User management routes (admin and super admin)
router.get('/users', auth, adminAuth, (req, res) => UserController.getAllUsers(req, res));
router.put('/users/:userId', auth, adminAuth, (req, res) => UserController.updateUser(req, res));

module.exports = router;
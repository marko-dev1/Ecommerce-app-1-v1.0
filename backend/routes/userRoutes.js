const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth, superAdminAuth } = require('../middleware/auth');

router.post('/admins', auth, superAdminAuth, UserController.createAdmin);
router.get('/admins', auth, superAdminAuth, UserController.getAllAdmins);
router.put('/:userId/role', auth, superAdminAuth, UserController.updateUserRole);
router.delete('/admins/:userId', auth, superAdminAuth, UserController.deleteAdmin);
router.post('/register', UserController.register);
router.post('/login',  UserController.login);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateProfile,
  toggleUserStatus,
} = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN'), getUsers);
router.put('/profile', updateProfile);
router.put('/:id/status', authorizeRoles('ADMIN'), toggleUserStatus);

module.exports = router;

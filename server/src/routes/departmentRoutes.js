const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.get('/', getDepartments);
router.post('/', authenticateUser, authorizeRoles('ADMIN'), createDepartment);
router.put('/:id', authenticateUser, authorizeRoles('ADMIN'), updateDepartment);
router.delete('/:id', authenticateUser, authorizeRoles('ADMIN'), deleteDepartment);

module.exports = router;

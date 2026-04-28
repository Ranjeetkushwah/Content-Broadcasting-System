const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, principalOnly } = require('../middlewares/auth');

// All routes are protected and require principal role
router.use(authMiddleware);
router.use(principalOnly);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;

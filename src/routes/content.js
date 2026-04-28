const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authMiddleware, principalOnly, teacherOnly, principalOrTeacher } = require('../middlewares/auth');
const { validateContentApproval } = require('../middlewares/validation');

// Protected routes
router.use(authMiddleware);

// Routes for both principals and teachers
router.get('/my', contentController.getMyContent);
router.get('/:id', contentController.getContentById);

// Teacher only routes
router.delete('/:id', teacherOnly, contentController.deleteContent);

// Principal only routes
router.get('/', principalOnly, contentController.getAllContent);
router.get('/pending', principalOnly, contentController.getPendingContent);
router.get('/stats', principalOnly, contentController.getContentStats);
router.put('/:id/status', principalOnly, validateContentApproval, contentController.updateContentStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authMiddleware, teacherOnly } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/fileUpload');
const { validateContentUpload } = require('../middlewares/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentUploadRequest:
 *       type: object
 *       required:
 *         - title
 *         - subject
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           description: Content title
 *         subject:
 *           type: string
 *           description: Subject category
 *         description:
 *           type: string
 *           description: Content description
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: When content becomes visible
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: When content stops being visible
 *         rotation_duration:
 *           type: integer
 *           minimum: 1
 *           description: Duration in minutes for rotation
 *     ScheduleUpdateRequest:
 *       type: object
 *       required:
 *         - rotation_duration
 *       properties:
 *         rotation_duration:
 *           type: integer
 *           minimum: 1
 *           description: Duration in minutes for rotation
 */

// All routes are protected and require teacher role
router.use(authMiddleware);
router.use(teacherOnly);

/**
 * @swagger
 * /api/upload/content:
 *   post:
 *     summary: Upload new content with file
 *     tags: [Content Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *               - subject
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, GIF, max 10MB)
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 description: Content title
 *               subject:
 *                 type: string
 *                 description: Subject category
 *               description:
 *                 type: string
 *                 description: Content description
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: When content becomes visible
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: When content stops being visible
 *               rotation_duration:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duration in minutes for rotation
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 content:
 *                   $ref: '#/components/schemas/Content'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/content', 
  upload.single('file'), 
  handleUploadError,
  validateContentUpload,
  uploadController.uploadContent
);

/**
 * @swagger
 * /api/upload/content/{contentId}/schedule:
 *   put:
 *     summary: Update content rotation schedule
 *     tags: [Content Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleUpdateRequest'
 *     responses:
 *       200:
 *         description: Content schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only modify own content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Content not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/content/:contentId/schedule', 
  uploadController.updateContentSchedule
);

module.exports = router;

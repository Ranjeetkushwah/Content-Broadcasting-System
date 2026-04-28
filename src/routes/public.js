const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

/**
 * @swagger
 * /content/live/teacher/{teacherId}:
 *   get:
 *     summary: Get currently active content for a specific teacher
 *     tags: [Public Broadcasting]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Content available for teacher
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveContentResponse'
 *       404:
 *         description: Teacher not found or no content available
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
router.get('/live/teacher/:teacherId', publicController.getLiveContentByTeacher);

/**
 * @swagger
 * /content/live/subject/{subject}:
 *   get:
 *     summary: Get currently active content for a specific subject
 *     tags: [Public Broadcasting]
 *     parameters:
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *         description: Subject name
 *     responses:
 *       200:
 *         description: Content status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Content available"
 *                     subject:
 *                       type: string
 *                     content:
 *                       $ref: '#/components/schemas/Content'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No content available"
 *                     subject:
 *                       type: string
 *                     content:
 *                       type: object
 *                       nullable: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/live/subject/:subject', publicController.getLiveContentBySubject);

/**
 * @swagger
 * /content/live:
 *   get:
 *     summary: Get all currently active content across all subjects
 *     tags: [Public Broadcasting]
 *     responses:
 *       200:
 *         description: Content status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Content available"
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subject:
 *                             type: string
 *                           content:
 *                             $ref: '#/components/schemas/Content'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No content available"
 *                     subjects:
 *                       type: array
 *                       items: {}
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/live', publicController.getAllLiveContent);

/**
 * @swagger
 * /content/status:
 *   get:
 *     summary: Get system status and rotation information
 *     tags: [Public Broadcasting]
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 system_status:
 *                   type: string
 *                   example: "operational"
 *                 rotation_status:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subject:
 *                         type: string
 *                       slot_id:
 *                         type: integer
 *                       current_active_content:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                       total_active_contents:
 *                         type: integer
 *                       rotation_cycle_minutes:
 *                         type: integer
 *                 content_statistics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       unique_teachers:
 *                         type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/status', publicController.getSystemStatus);

module.exports = router;

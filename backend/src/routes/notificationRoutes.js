const express = require('express');
const router = express.Router();
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    createAnnouncement,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getMyNotifications);
router.put('/mark-all-read', authMiddleware, markAllAsRead);
router.put('/:id/read', authMiddleware, markAsRead);
router.post('/announcement', authMiddleware, allowRoles('admin'), createAnnouncement);

module.exports = router;

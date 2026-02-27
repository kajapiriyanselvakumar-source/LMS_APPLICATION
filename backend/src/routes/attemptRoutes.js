const express = require('express');
const router = express.Router();
const { submitAttempt, getAttemptsByQuiz, getAttemptsByStudent } = require('../controllers/attemptController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, allowRoles('student'), submitAttempt);
router.get('/quiz/:quizId', authMiddleware, allowRoles('teacher', 'admin'), getAttemptsByQuiz);
router.get('/student/:studentId', authMiddleware, getAttemptsByStudent);
router.get('/me', authMiddleware, allowRoles('student'), (req, res, next) => {
    req.params.studentId = req.user.id;
    next();
}, getAttemptsByStudent);

module.exports = router;

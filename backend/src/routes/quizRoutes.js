const express = require('express');
const router = express.Router();
const { getQuizzesBySubject, createQuiz, updateQuiz, publishQuiz, deleteQuiz } = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/subject/:subjectId', authMiddleware, getQuizzesBySubject);
router.post('/', authMiddleware, allowRoles('teacher', 'admin'), createQuiz);
router.put('/:id', authMiddleware, allowRoles('teacher', 'admin'), updateQuiz);
router.put('/:id/publish', authMiddleware, allowRoles('teacher', 'admin'), publishQuiz);
router.delete('/:id', authMiddleware, allowRoles('teacher', 'admin'), deleteQuiz);

module.exports = router;

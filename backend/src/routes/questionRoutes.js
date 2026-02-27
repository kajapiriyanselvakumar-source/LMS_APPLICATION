const express = require('express');
const router = express.Router();
const { getQuestionsByQuiz, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/quiz/:quizId', authMiddleware, getQuestionsByQuiz);
router.post('/', authMiddleware, allowRoles('teacher', 'admin'), createQuestion);
router.put('/:id', authMiddleware, allowRoles('teacher', 'admin'), updateQuestion);
router.delete('/:id', authMiddleware, allowRoles('teacher', 'admin'), deleteQuestion);

module.exports = router;

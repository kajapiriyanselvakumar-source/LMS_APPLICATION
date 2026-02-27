const express = require('express');
const router = express.Router();
const { getAllSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getAllSubjects);
router.post('/', authMiddleware, allowRoles('teacher', 'admin'), createSubject);
router.put('/:id', authMiddleware, allowRoles('teacher', 'admin'), updateSubject);
router.delete('/:id', authMiddleware, allowRoles('admin'), deleteSubject);

module.exports = router;

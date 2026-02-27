const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getNotesBySubject, uploadNote, deleteNote } = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/subject/:subjectId', authMiddleware, getNotesBySubject);
router.post('/', authMiddleware, allowRoles('teacher', 'admin'), upload.single('file'), uploadNote);
router.delete('/:id', authMiddleware, allowRoles('teacher', 'admin'), deleteNote);

module.exports = router;

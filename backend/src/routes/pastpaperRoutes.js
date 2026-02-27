const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getPastPapersBySubject, uploadPastPaper, deletePastPaper } = require('../controllers/pastpaperController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } });

router.get('/subject/:subjectId', authMiddleware, getPastPapersBySubject);
router.post('/', authMiddleware, allowRoles('teacher', 'admin'), upload.single('file'), uploadPastPaper);
router.delete('/:id', authMiddleware, allowRoles('teacher', 'admin'), deletePastPaper);

module.exports = router;

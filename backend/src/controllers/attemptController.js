const supabase = require('../config/supabase');
const { triggerNotification } = require('../utils/webhookUtils');

// POST /api/attempts — Student submits quiz
const submitAttempt = async (req, res) => {
    try {
        const { quiz_id, answers } = req.body; // answers: { [questionId]: studentAnswer }
        const student_id = req.user.id;

        if (!quiz_id || !answers) return res.status(400).json({ message: 'quiz_id and answers required' });

        // Check if already attempted
        const { data: existing } = await supabase
            .from('attempts')
            .select('id')
            .eq('quiz_id', quiz_id)
            .eq('student_id', student_id)
            .single();

        if (existing) return res.status(409).json({ message: 'Quiz already attempted' });

        // Fetch questions with correct answers
        const { data: questions } = await supabase
            .from('questions')
            .select('id, correct_answer, marks, type')
            .eq('quiz_id', quiz_id);

        // Auto-score (MCQ)
        let score = 0;
        if (questions) {
            for (const q of questions) {
                if (q.type === 'mcq') {
                    const studentAns = answers[q.id];
                    if (studentAns && studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
                        score += q.marks || 1;
                    }
                }
                // short_answer scored manually (count 0 for now, teacher can override)
            }
        }

        const { data: attempt, error } = await supabase
            .from('attempts')
            .insert({ quiz_id, student_id, answers, score })
            .select()
            .single();

        if (error) throw error;

        // Notify the student with their score
        await triggerNotification({
            type: 'grade',
            recipients: [student_id],
            message: `Quiz submitted! Your score: ${score}`,
            message_ta: `வினாடி வினா சமர்ப்பிக்கப்பட்டது! உங்கள் மதிப்பெண்: ${score}`,
            ref_id: attempt.id,
        });

        return res.status(201).json({ ...attempt, score });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/attempts/quiz/:quizId — teacher/admin view all attempts
const getAttemptsByQuiz = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('attempts')
            .select('*, users!attempts_student_id_fkey(id, full_name, grade)')
            .eq('quiz_id', req.params.quizId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/attempts/student/:studentId
const getAttemptsByStudent = async (req, res) => {
    try {
        // Students can only see their own
        if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { data, error } = await supabase
            .from('attempts')
            .select('*, quizzes(title, title_ta, subjects(name, name_ta))')
            .eq('student_id', req.params.studentId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { submitAttempt, getAttemptsByQuiz, getAttemptsByStudent };

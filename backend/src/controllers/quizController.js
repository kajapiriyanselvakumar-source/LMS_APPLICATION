const supabase = require('../config/supabase');
const { triggerNotification } = require('../utils/webhookUtils');

// GET /api/quizzes/subject/:subjectId
const getQuizzesBySubject = async (req, res) => {
    try {
        let query = supabase
            .from('quizzes')
            .select('*, users!quizzes_teacher_id_fkey(id, full_name)')
            .eq('subject_id', req.params.subjectId)
            .order('created_at', { ascending: false });

        // Students only see published quizzes
        if (req.user.role === 'student') {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/quizzes
const createQuiz = async (req, res) => {
    try {
        const { title, title_ta, subject_id, deadline, duration_minutes } = req.body;
        if (!title || !subject_id) return res.status(400).json({ message: 'Title and subject required' });

        const { data, error } = await supabase
            .from('quizzes')
            .insert({
                title,
                title_ta,
                subject_id,
                teacher_id: req.user.id,
                deadline,
                duration_minutes: duration_minutes || 30,
                is_published: false,
            })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
    try {
        const { title, title_ta, deadline, duration_minutes } = req.body;
        const { data, error } = await supabase
            .from('quizzes')
            .update({ title, title_ta, deadline, duration_minutes })
            .eq('id', req.params.id)
            .eq('teacher_id', req.user.id)
            .select()
            .single();
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/quizzes/:id/publish
const publishQuiz = async (req, res) => {
    try {
        const { data: quiz, error: fetchErr } = await supabase
            .from('quizzes')
            .select('*, subjects(grade)')
            .eq('id', req.params.id)
            .eq('teacher_id', req.user.id)
            .single();

        if (fetchErr || !quiz) return res.status(404).json({ message: 'Quiz not found' });

        const { data, error } = await supabase
            .from('quizzes')
            .update({ is_published: true })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // Notify students of this grade
        const grade = quiz.subjects?.grade;
        if (grade) {
            const { data: students } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'student')
                .eq('grade', grade);

            if (students?.length) {
                await triggerNotification({
                    type: 'quiz',
                    recipients: students.map((s) => s.id),
                    message: `New quiz published: ${quiz.title}`,
                    message_ta: `புதிய வினாடி வினா: ${quiz.title_ta || quiz.title}`,
                    ref_id: quiz.id,
                });
            }
        }

        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
    try {
        const { error } = await supabase.from('quizzes').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'Quiz deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getQuizzesBySubject, createQuiz, updateQuiz, publishQuiz, deleteQuiz };

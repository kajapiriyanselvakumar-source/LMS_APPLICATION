const supabase = require('../config/supabase');

// GET /api/questions/quiz/:quizId
const getQuestionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        // Students don't see correct answers
        let selectFields = 'id, quiz_id, subject_id, question_text, question_text_ta, type, options, marks';
        if (req.user.role !== 'student') {
            selectFields += ', correct_answer';
        }

        const { data, error } = await supabase
            .from('questions')
            .select(selectFields)
            .eq('quiz_id', quizId)
            .order('created_at');

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/questions
const createQuestion = async (req, res) => {
    try {
        const { quiz_id, subject_id, question_text, question_text_ta, type, options, correct_answer, marks } = req.body;

        if (!quiz_id || !question_text || !type || !correct_answer) {
            return res.status(400).json({ message: 'Required fields missing' });
        }

        const { data, error } = await supabase
            .from('questions')
            .insert({ quiz_id, subject_id, question_text, question_text_ta, type, options, correct_answer, marks: marks || 1 })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/questions/:id
const updateQuestion = async (req, res) => {
    try {
        const { question_text, question_text_ta, type, options, correct_answer, marks } = req.body;
        const { data, error } = await supabase
            .from('questions')
            .update({ question_text, question_text_ta, type, options, correct_answer, marks })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
    try {
        const { error } = await supabase.from('questions').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'Question deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getQuestionsByQuiz, createQuestion, updateQuestion, deleteQuestion };

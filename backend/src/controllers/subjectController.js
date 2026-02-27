const supabase = require('../config/supabase');

// GET /api/subjects
const getAllSubjects = async (req, res) => {
    try {
        const { grade } = req.query;
        let query = supabase
            .from('subjects')
            .select('*, users!subjects_teacher_id_fkey(id, full_name)')
            .order('grade');

        // Students only see their grade's subjects
        if (req.user.role === 'student') {
            const { data: userRow } = await supabase.from('users').select('grade').eq('id', req.user.id).single();
            if (userRow?.grade) query = query.eq('grade', userRow.grade);
        } else if (grade) {
            query = query.eq('grade', grade);
        }

        const { data, error } = await query;
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/subjects
const createSubject = async (req, res) => {
    try {
        const { name, name_ta, grade, teacher_id } = req.body;
        if (!name || !grade) return res.status(400).json({ message: 'Name and grade required' });

        const { data, error } = await supabase
            .from('subjects')
            .insert({ name, name_ta, grade, teacher_id: teacher_id || req.user.id })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
    try {
        const { name, name_ta, grade, teacher_id } = req.body;
        const { data, error } = await supabase
            .from('subjects')
            .update({ name, name_ta, grade, teacher_id })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
    try {
        const { error } = await supabase.from('subjects').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'Subject deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllSubjects, createSubject, updateSubject, deleteSubject };

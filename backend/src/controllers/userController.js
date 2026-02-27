const supabase = require('../config/supabase');

// GET /api/users
const getAllUsers = async (req, res) => {
    try {
        const { role, grade } = req.query;
        let query = supabase.from('users').select('id, email, full_name, role, grade, language_pref, created_at');
        if (role) query = query.eq('role', role);
        if (grade) query = query.eq('grade', grade);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, email, full_name, role, grade, language_pref, created_at')
            .eq('id', req.params.id)
            .single();
        if (error || !data) return res.status(404).json({ message: 'User not found' });
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
    try {
        const { full_name, grade, language_pref } = req.body;

        // Only admin can change role
        const updates = { full_name, grade, language_pref };
        if (req.user.role === 'admin' && req.body.role) {
            updates.role = req.body.role;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', req.params.id)
            .select('id, email, full_name, role, grade, language_pref')
            .single();

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'User deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };

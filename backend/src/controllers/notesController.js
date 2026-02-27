const supabase = require('../config/supabase');
const { triggerNotification } = require('../utils/webhookUtils');

// GET /api/notes/subject/:subjectId
const getNotesBySubject = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*, users!notes_teacher_id_fkey(id, full_name)')
            .eq('subject_id', req.params.subjectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/notes
const uploadNote = async (req, res) => {
    try {
        const { title, title_ta, subject_id } = req.body;
        const file = req.file;

        if (!file || !title || !subject_id) {
            return res.status(400).json({ message: 'Title, subject, and file required' });
        }

        // Upload to Supabase storage
        const fileName = `${Date.now()}_${file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from('notes')
            .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('notes').getPublicUrl(fileName);

        // Insert DB record
        const { data: note, error } = await supabase
            .from('notes')
            .insert({
                title,
                title_ta,
                subject_id,
                teacher_id: req.user.id,
                file_url: urlData.publicUrl,
                file_type: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            })
            .select()
            .single();

        if (error) throw error;

        // Notify students enrolled in this subject's grade
        const { data: subjectRow } = await supabase.from('subjects').select('grade').eq('id', subject_id).single();
        if (subjectRow) {
            const { data: students } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'student')
                .eq('grade', subjectRow.grade);

            if (students?.length) {
                await triggerNotification({
                    type: 'note',
                    recipients: students.map((s) => s.id),
                    message: `New note uploaded: ${title}`,
                    message_ta: `புதிய குறிப்பு: ${title_ta || title}`,
                    ref_id: note.id,
                });
            }
        }

        return res.status(201).json(note);
    } catch (err) {
        console.error('Upload note error:', err.message);
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        const { data: note } = await supabase.from('notes').select('file_url').eq('id', req.params.id).single();

        if (note?.file_url) {
            const fileName = note.file_url.split('/').pop();
            await supabase.storage.from('notes').remove([fileName]);
        }

        const { error } = await supabase.from('notes').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'Note deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getNotesBySubject, uploadNote, deleteNote };

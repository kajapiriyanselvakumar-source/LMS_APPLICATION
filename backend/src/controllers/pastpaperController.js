const supabase = require('../config/supabase');

// GET /api/pastpapers/subject/:subjectId
const getPastPapersBySubject = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('past_papers')
            .select('*, users!past_papers_teacher_id_fkey(id, full_name)')
            .eq('subject_id', req.params.subjectId)
            .order('year', { ascending: false });

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/pastpapers
const uploadPastPaper = async (req, res) => {
    try {
        const { title, subject_id, year } = req.body;
        const file = req.file;

        if (!file || !title || !subject_id || !year) {
            return res.status(400).json({ message: 'Title, subject, year, and file required' });
        }

        const fileName = `${Date.now()}_${file.originalname}`;
        const { error: uploadError } = await supabase.storage
            .from('past-papers')
            .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('past-papers').getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('past_papers')
            .insert({
                title,
                subject_id,
                teacher_id: req.user.id,
                year: parseInt(year),
                file_url: urlData.publicUrl,
            })
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/pastpapers/:id
const deletePastPaper = async (req, res) => {
    try {
        const { data: paper } = await supabase.from('past_papers').select('file_url').eq('id', req.params.id).single();

        if (paper?.file_url) {
            const fileName = paper.file_url.split('/').pop();
            await supabase.storage.from('past-papers').remove([fileName]);
        }

        const { error } = await supabase.from('past_papers').delete().eq('id', req.params.id);
        if (error) throw error;
        return res.json({ message: 'Past paper deleted' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getPastPapersBySubject, uploadPastPaper, deletePastPaper };

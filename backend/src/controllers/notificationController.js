const supabase = require('../config/supabase');
const { triggerNotification } = require('../utils/webhookUtils');

// GET /api/notifications — own notifications
const getMyNotifications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        return res.json({ message: 'Marked as read' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', req.user.id)
            .eq('is_read', false);

        if (error) throw error;
        return res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/notifications/announcement — admin creates announcement
const createAnnouncement = async (req, res) => {
    try {
        const { title, title_ta, body, body_ta, role_target } = req.body;

        const { data: ann, error } = await supabase
            .from('announcements')
            .insert({ title, title_ta, body, body_ta, role_target: role_target || 'all', created_by: req.user.id })
            .select()
            .single();

        if (error) throw error;

        // Find recipients
        let recipientQuery = supabase.from('users').select('id');
        if (role_target && role_target !== 'all') {
            recipientQuery = recipientQuery.eq('role', role_target);
        }
        const { data: recipients } = await recipientQuery;

        if (recipients?.length) {
            await triggerNotification({
                type: 'announcement',
                recipients: recipients.map((u) => u.id),
                message: title,
                message_ta: title_ta || title,
                ref_id: ann.id,
            });
        }

        return res.status(201).json(ann);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, createAnnouncement };

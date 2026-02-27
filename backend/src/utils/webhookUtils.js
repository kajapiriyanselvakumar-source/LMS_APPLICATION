const supabase = require('../config/supabase');

// Trigger notification for a list of recipients
const triggerNotification = async ({ type, recipients, message, message_ta, ref_id }) => {
    try {
        if (!recipients || recipients.length === 0) return;

        const rows = recipients.map((userId) => ({
            user_id: userId,
            type,
            message,
            message_ta,
            ref_id: ref_id || null,
            is_read: false,
        }));

        const { error } = await supabase.from('notifications').insert(rows);
        if (error) console.error('Notification insert error:', error.message);
    } catch (err) {
        console.error('webhookUtils error:', err.message);
    }
};

module.exports = { triggerNotification };

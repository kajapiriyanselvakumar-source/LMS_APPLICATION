import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './useAuth';
import { createClient } from '@supabase/supabase-js';

// Initialize a lightweight Supabase client for realtime (using anon key)
const supabaseRealtime = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        // Subscribe to real-time notifications for the specific user
        const channel = supabaseRealtime
            .channel(`notifications:user_id=eq.${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabaseRealtime.removeChannel(channel);
        };
    }, [user?.id]);

    const markAllRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllRead
    };
};

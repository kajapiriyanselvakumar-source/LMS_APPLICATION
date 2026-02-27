import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Info, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

const NotificationBell = () => {
    const { i18n } = useTranslation();
    const { notifications, unreadCount, markAllRead } = useNotifications();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const isTamil = i18n.language === 'ta';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'note': return <Info className="text-blue-500" size={18} />;
            case 'quiz': return <CheckCircle className="text-green-500" size={18} />;
            case 'deadline': return <AlertTriangle className="text-orange-500" size={18} />;
            default: return <Bell className="text-gray-400" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all outline-none"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-4 w-96 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-lg font-black tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-black text-primary hover:underline transition-all"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-4 ${!n.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold leading-tight ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                {isTamil ? (n.title_ta || n.title) : n.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {isTamil ? (n.message_ta || n.message) : n.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none">
                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {n.link && (
                                                    <Link
                                                        to={n.link}
                                                        onClick={() => setShowDropdown(false)}
                                                        className="text-[10px] font-black text-primary flex items-center gap-1 uppercase tracking-tighter"
                                                    >
                                                        Explore <ExternalLink size={10} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center px-10">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                    <Bell size={24} />
                                </div>
                                <p className="text-gray-400 font-bold text-sm">Quiet as a library...</p>
                                <p className="text-gray-500 text-xs mt-1">No notifications for you yet.</p>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/notifications"
                        onClick={() => setShowDropdown(false)}
                        className="block py-4 bg-gray-50 dark:bg-gray-800 text-center text-xs font-black text-gray-500 hover:text-primary transition-all uppercase tracking-widest"
                    >
                        Check all messages
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

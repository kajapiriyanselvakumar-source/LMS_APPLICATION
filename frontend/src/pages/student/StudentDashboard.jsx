import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Book, Users, ClipboardCheck, GraduationCap } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('welcome')}, {user?.full_name}! 👋
                </h1>
                <p className="text-gray-500 mt-2">Here is what's happening in your Grade {user?.grade} classes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/student/subjects" className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 mb-6">
                        <Book size={28} />
                    </div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-3">{t('subjects')}</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-gray-900 dark:text-white">8</p>
                        <div className="text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Explore →</div>
                    </div>
                </Link>

                <Link to="/student/results" className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 mb-6">
                        <ClipboardCheck size={28} />
                    </div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-3">{t('quizzes')}</h3>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-gray-900 dark:text-white">12</p>
                        <div className="text-purple-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">View Results →</div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default StudentDashboard;

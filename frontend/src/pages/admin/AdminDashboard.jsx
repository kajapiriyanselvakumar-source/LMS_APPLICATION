import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Shield, Users, BookMarked, Settings } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('welcome')}, {t('admin')}! 🛡️
                </h1>
                <p className="text-gray-500 mt-2">System overview and control center.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="text-lg font-bold">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">1,240</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                        <BookMarked size={24} />
                    </div>
                    <h3 className="text-lg font-bold">Active Subjects</h3>
                    <p className="text-3xl font-bold mt-2">42</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

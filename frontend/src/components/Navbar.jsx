import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import { LogOut, LayoutDashboard, User, Bell, BookOpen } from 'lucide-react';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg shadow-primary/20 shadow-lg">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                                LMS Pro
                            </span>
                        </Link>

                        <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                            {user && (
                                <>
                                    <NavLink
                                        to={`/${user.role}/dashboard`}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'text-primary bg-primary/5'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`
                                        }
                                    >
                                        <LayoutDashboard size={18} />
                                        {t('dashboard')}
                                    </NavLink>
                                    <NavLink
                                        to={`/${user.role}/subjects`}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'text-primary bg-primary/5'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`
                                        }
                                    >
                                        <BookOpen size={18} />
                                        {t('subjects')}
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />

                        {user ? (
                            <>
                                <NotificationBell />
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:block text-right">
                                        <p className="text-sm font-semibold">{user.full_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{t(user.role)}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                        title={t('logout')}
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg shadow-md hover:shadow-lg transition-all"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

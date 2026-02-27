import React from 'react';
import { useTranslation } from 'react-i18next';
import { Book, User, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubjectCard = ({ subject, role }) => {
    const { i18n } = useTranslation();
    const isTamil = i18n.language === 'ta';

    const subjectName = isTamil ? (subject.name_ta || subject.name) : subject.name;
    const teacherName = subject.users?.full_name || 'Assigned Teacher';

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Book size={24} />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-500 dark:text-gray-400">
                    <GraduationCap size={14} />
                    Grade {subject.grade}
                </div>
            </div>

            <h3 className="text-xl font-bold mb-2 line-clamp-1">{subjectName}</h3>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <User size={16} />
                <span>{teacherName}</span>
            </div>

            <Link
                to={`/${role}/subjects/${subject.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-primary hover:text-white text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-all duration-300"
            >
                View Content
                <ChevronRight size={18} />
            </Link>
        </div>
    );
};

export default SubjectCard;

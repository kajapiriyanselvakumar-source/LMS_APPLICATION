import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
    Trophy,
    Target,
    Clock,
    ChevronRight,
    BookOpen,
    Loader2,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentResults = () => {
    const { t, i18n } = useTranslation();
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isTamil = i18n.language === 'ta';

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get('/attempts/student/me');
                setAttempts(data);
            } catch (err) {
                toast.error('Failed to load performance data');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-500 font-black tracking-widest text-sm uppercase">CALCULATING ACADEMIC STANDINGS...</p>
            </div>
        );
    }

    const averageScore = attempts.length > 0
        ? (attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length).toFixed(1)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">My Progress</h1>
                <p className="text-lg text-gray-500 font-medium">Detailed breakdown of your quiz attempts and learning journey</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-3xl text-white shadow-2xl shadow-primary/20">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Trophy size={24} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest opacity-80">Average Score</p>
                    </div>
                    <p className="text-5xl font-black mb-1">{averageScore}%</p>
                    <p className="text-xs font-medium opacity-70">Across {attempts.length} evaluations</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600">
                            <Target size={24} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Quizzes Completed</p>
                    </div>
                    <p className="text-5xl font-black text-gray-900 dark:text-white mb-1">{attempts.length}</p>
                    <p className="text-xs font-medium text-gray-500">Total attempts registered</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
                            <Clock size={24} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400">Total Time Spent</p>
                    </div>
                    <p className="text-5xl font-black text-gray-900 dark:text-white mb-1">
                        {attempts.reduce((acc, curr) => acc + (curr.quizzes?.duration_minutes || 0), 0)}
                    </p>
                    <p className="text-xs font-medium text-gray-500">Minutes in active learning</p>
                </div>
            </div>

            {/* Detailed Table/List */}
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Recent Attempts</h2>
                {attempts.length > 0 ? attempts.map((attempt) => (
                    <div key={attempt.id} className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
                        <div className="flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black ${attempt.score >= 75 ? 'bg-green-100 text-green-600' :
                                attempt.score >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
                                }`}>
                                <span className="text-2xl leading-none">{attempt.score}</span>
                                <span className="text-[10px] uppercase tracking-tighter">%</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                    {isTamil ? (attempt.quizzes?.title_ta || attempt.quizzes?.title) : attempt.quizzes?.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <BookOpen size={14} />
                                        {isTamil ? (attempt.quizzes?.subjects?.name_ta || attempt.quizzes?.subjects?.name) : attempt.quizzes?.subjects?.name}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(attempt.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-primary hover:text-white text-gray-500 font-bold rounded-xl transition-all">
                                View Feedback
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                        <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-bold text-lg">No assessment attempts found.</p>
                        <p className="text-gray-400 text-sm mt-1">Participate in quizzes to track your performance here!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentResults;

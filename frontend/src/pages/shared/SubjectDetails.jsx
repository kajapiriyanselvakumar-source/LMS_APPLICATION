import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
    FileText,
    Download,
    Plus,
    Clock,
    ChevronLeft,
    PlayCircle,
    Loader2,
    Trash2,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import FileUploader from '../../components/FileUploader';
import QuizBuilder from '../../components/QuizBuilder';

const SubjectDetails = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [subject, setSubject] = useState(null);
    const [notes, setNotes] = useState([]);
    const [pastPapers, setPastPapers] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notes');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [uploadType, setUploadType] = useState('note');

    const isTamil = i18n.language === 'ta';
    const isTeacher = user?.role === 'teacher';

    const fetchData = async () => {
        try {
            const [subjectRes, notesRes, papersRes, quizzesRes] = await Promise.all([
                api.get(`/subjects/${id}`),
                api.get(`/notes/subject/${id}`),
                api.get(`/pastpapers/subject/${id}`),
                api.get(`/quizzes/subject/${id}`)
            ]);
            setSubject(subjectRes.data);
            setNotes(notesRes.data);
            setPastPapers(papersRes.data);
            setQuizzes(quizzesRes.data);
        } catch (err) {
            toast.error('Failed to load subject data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-500 font-medium tracking-wide">Loading subject materials...</p>
            </div>
        );
    }

    const subjectName = isTamil ? (subject?.name_ta || subject?.name) : subject?.name;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb & Header */}
            <div className="mb-8">
                <Link
                    to={`/${user.role}/subjects`}
                    className="inline-flex items-center text-primary font-medium hover:underline mb-4 transition-all"
                >
                    <ChevronLeft size={20} />
                    Back to Subjects
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                            {subjectName}
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">
                            Grade {subject?.grade} • {subject?.users?.full_name}
                        </p>
                    </div>
                    {isTeacher && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => { setUploadType('note'); setShowUploadModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
                            >
                                <Plus size={20} />
                                Add Note
                            </button>
                            <button
                                onClick={() => { setUploadType('pastpaper'); setShowUploadModal(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
                            >
                                <Plus size={20} />
                                Add Paper
                            </button>
                            <button
                                onClick={() => setShowQuizModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
                            >
                                <Plus size={20} />
                                Create Quiz
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <FileUploader
                            subjectId={id}
                            type={uploadType}
                            onUploadSuccess={() => { setShowUploadModal(false); fetchData(); }}
                        />
                    </div>
                </div>
            )}

            {showQuizModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl">
                        <button
                            onClick={() => setShowQuizModal(false)}
                            className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <QuizBuilder
                            subjectId={id}
                            onCreated={() => { setShowQuizModal(false); fetchData(); }}
                        />
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto no-scrollbar">
                {[
                    { id: 'notes', label: t('notes'), icon: FileText },
                    { id: 'papers', label: t('pastPapers'), icon: FileText },
                    { id: 'quizzes', label: t('quizzes'), icon: PlayCircle }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap outline-none ${activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'notes' && (
                    notes.length > 0 ? notes.map(note => (
                        <div key={note.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                                    <FileText size={20} />
                                </div>
                                {isTeacher && (
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                {isTamil ? (note.title_ta || note.title) : note.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">{new Date(note.created_at).toLocaleDateString()}</p>
                            <a
                                href={note.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                            >
                                <Download size={16} />
                                Download
                            </a>
                        </div>
                    )) : <div className="col-span-full py-12 text-center text-gray-500 font-medium italic">No notes available yet.</div>
                )}

                {activeTab === 'papers' && (
                    pastPapers.length > 0 ? pastPapers.map(paper => (
                        <div key={paper.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
                                    <FileText size={20} />
                                </div>
                                <span className="px-2 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-md">{paper.year}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">{paper.title}</h3>
                            <a
                                href={paper.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all"
                            >
                                <Download size={16} />
                                Open Paper
                            </a>
                        </div>
                    )) : <div className="col-span-full py-12 text-center text-gray-500 font-medium italic">No past papers uploaded.</div>
                )}

                {activeTab === 'quizzes' && (
                    quizzes.length > 0 ? quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <PlayCircle size={20} />
                                </div>
                                {quiz.deadline && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">
                                        <Clock size={12} />
                                        {new Date(quiz.deadline).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                {isTamil ? (quiz.title_ta || quiz.title) : quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">{quiz.duration_minutes} Minutes Duration</p>
                            <Link
                                to={`/${user.role}/quiz/${quiz.id}`}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                            >
                                {user.role === 'student' ? 'Start Quiz' : 'Manage Questions'}
                            </Link>
                        </div>
                    )) : <div className="col-span-full py-12 text-center text-gray-500 font-medium italic">No active quizzes found.</div>
                )}
            </div>
        </div>
    );
};

export default SubjectDetails;

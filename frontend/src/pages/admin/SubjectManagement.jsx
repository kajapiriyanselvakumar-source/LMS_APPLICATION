import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
    BookMarked,
    Plus,
    Search,
    Edit2,
    Trash2,
    GraduationCap,
    User,
    Loader2,
    X,
    Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SubjectManagement = () => {
    const { t } = useTranslation();
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        name_ta: '',
        grade: 11,
        teacher_id: ''
    });

    const fetchData = async () => {
        try {
            const [subjectRes, userRes] = await Promise.all([
                api.get('/subjects'),
                api.get('/users') // I'll filter for teachers only
            ]);
            setSubjects(subjectRes.data);
            setTeachers(userRes.data.filter(u => u.role === 'teacher'));
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subject and all associated materials?')) return;
        try {
            await api.delete(`/subjects/${id}`);
            toast.success('Subject removed');
            fetchData();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/subjects', formData);
            toast.success('Subject created successfully');
            setShowAddModal(false);
            setFormData({ name: '', name_ta: '', grade: 11, teacher_id: '' });
            fetchData();
        } catch (err) {
            toast.error('Failed to create subject');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.name_ta && s.name_ta.includes(searchTerm))
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <BookMarked className="text-primary" size={32} />
                        Subject Management
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Configure classes and assign teachers</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all outline-none"
                >
                    <Plus size={20} />
                    Create Subject
                </button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search subjects..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center">
                        <Loader2 className="animate-spin text-primary mb-4" size={40} />
                        <p className="text-gray-500 font-bold tracking-widest">ORGANIZING ACADEMIC STRUCTURE...</p>
                    </div>
                ) : filteredSubjects.map(s => (
                    <div key={s.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                                <GraduationCap size={14} />
                                Grade {s.grade}
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                        <p className="text-sm text-gray-400 font-medium mb-4">{s.name_ta || 'No Tamil Title'}</p>

                        <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                <User size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Teacher</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                    {s.users?.full_name || 'Unassigned'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fill-mode-both duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black tracking-tight">Create Subject</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubject} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Subject Name (English)</label>
                                    <input
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                        placeholder="Mathematics"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Subject Name (Tamil)</label>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                        placeholder="கணிதம்"
                                        value={formData.name_ta}
                                        onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Assigned Grade</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="11"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Assign Teacher</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                            value={formData.teacher_id}
                                            onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                        >
                                            <option value="">Select Teacher</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all mt-6 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                    Save Subject
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;

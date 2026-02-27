import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import SubjectCard from '../../components/SubjectCard';
import { Search, Loader2 } from 'lucide-react';

const Subjects = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await api.get('/subjects');
                setSubjects(data);
            } catch (err) {
                console.error('Failed to fetch subjects');
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subject.name_ta && subject.name_ta.includes(searchTerm))
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('subjects')}</h1>
                    <p className="text-gray-500 mt-1">Explore and manage your learning resources</p>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Search subjects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Loading subjects...</p>
                </div>
            ) : filteredSubjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSubjects.map((subject) => (
                        <SubjectCard key={subject.id} subject={subject} role={user?.role} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">No subjects found</p>
                </div>
            )}
        </div>
    );
};

export default Subjects;

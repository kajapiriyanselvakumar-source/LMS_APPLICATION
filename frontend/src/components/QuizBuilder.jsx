import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, CheckCircle, Save, Loader2, List, Type } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const QuizBuilder = ({ subjectId, onCreated }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState({
        title: '',
        title_ta: '',
        duration_minutes: 30,
        deadline: '',
        is_published: false
    });

    const [questions, setQuestions] = useState([
        { question_text: '', question_text_ta: '', type: 'mcq', options: [{ label: '', value: 'A' }], correct_answer: 'A', marks: 5 }
    ]);

    const addQuestion = () => {
        setQuestions([...questions, {
            question_text: '',
            question_text_ta: '',
            type: 'mcq',
            options: [{ label: '', value: 'A' }],
            correct_answer: 'A',
            marks: 5
        }]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const addOption = (qIndex) => {
        const newQuestions = [...questions];
        const nextValue = String.fromCharCode(65 + newQuestions[qIndex].options.length);
        newQuestions[qIndex].options.push({ label: '', value: nextValue });
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, label) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex].label = label;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!quizData.title || questions.some(q => !q.question_text)) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Quiz
            const quizRes = await api.post('/quizzes', { ...quizData, subject_id: subjectId });
            const quizId = quizRes.data.id;

            // 2. Create Questions
            await Promise.all(questions.map(q =>
                api.post('/questions', { ...q, quiz_id: quizId, subject_id: subjectId })
            ));

            toast.success('Quiz created successfully!');
            onCreated();
        } catch (err) {
            toast.error('Failed to create quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tight">Create New Quiz</h2>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all outline-none"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Quiz
                </button>
            </div>

            {/* Quiz Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Quiz Title (English)</label>
                        <input
                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-bold"
                            placeholder="e.g. Algebra Basics"
                            value={quizData.title}
                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Quiz Title (Tamil)</label>
                        <input
                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-bold"
                            placeholder="வினாடி வினா தலைப்பு"
                            value={quizData.title_ta}
                            onChange={(e) => setQuizData({ ...quizData, title_ta: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Duration (Minutes)</label>
                        <input
                            type="number"
                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-bold"
                            value={quizData.duration_minutes}
                            onChange={(e) => setQuizData({ ...quizData, duration_minutes: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Deadline</label>
                        <input
                            type="datetime-local"
                            className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all font-bold"
                            value={quizData.deadline}
                            onChange={(e) => setQuizData({ ...quizData, deadline: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
                {questions.map((q, qIdx) => (
                    <div key={qIdx} className="relative group bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                        <button
                            onClick={() => removeQuestion(qIdx)}
                            className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 text-red-500 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-all border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-10 h-10 flex items-center justify-center bg-primary text-white font-black rounded-xl">
                                {qIdx + 1}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateQuestion(qIdx, 'type', 'mcq')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${q.type === 'mcq' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <List size={14} /> MCQ
                                </button>
                                <button
                                    onClick={() => updateQuestion(qIdx, 'type', 'short_answer')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${q.type === 'short_answer' ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Type size={14} /> SHORT ANSWER
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <input
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-bold placeholder:italic"
                                placeholder="Question text (English)"
                                value={q.question_text}
                                onChange={(e) => updateQuestion(qIdx, 'question_text', e.target.value)}
                            />
                            <input
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-bold placeholder:italic"
                                placeholder="கேள்வி உரை (Tamil)"
                                value={q.question_text_ta}
                                onChange={(e) => updateQuestion(qIdx, 'question_text_ta', e.target.value)}
                            />
                        </div>

                        {q.type === 'mcq' && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Options & Correct Answer</p>
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex gap-3">
                                        <button
                                            onClick={() => updateQuestion(qIdx, 'correct_answer', opt.value)}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${q.correct_answer === opt.value ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:text-green-500'}`}
                                        >
                                            {opt.value}
                                        </button>
                                        <input
                                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all font-medium text-sm"
                                            placeholder={`Option ${opt.value}`}
                                            value={opt.label}
                                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => addOption(qIdx)}
                                    className="flex items-center gap-2 text-primary font-black text-xs hover:underline mt-2 ml-1"
                                >
                                    <Plus size={14} /> Add Option
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button
                    onClick={addQuestion}
                    className="w-full py-6 bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 font-black"
                >
                    <Plus size={32} />
                    ADD ANOTHER QUESTION
                </button>
            </div>
        </div>
    );
};

export default QuizBuilder;

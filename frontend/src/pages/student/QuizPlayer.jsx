import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Clock, CheckCircle, ChevronRight, ChevronLeft, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const QuizPlayer = () => {
    const { quizId } = useParams();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [score, setScore] = useState(null);

    const timerRef = useRef(null);
    const isTamil = i18n.language === 'ta';

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const [quizRes, questionsRes] = await Promise.all([
                    api.get(`/quizzes/${quizId}`), // I need to add this route to backend if missing, or use subject fetch
                    api.get(`/questions/quiz/${quizId}`)
                ]);

                // Note: I might need a single quiz GET route in backend. 
                // For now let's assume questionsRes returns what we need.
                const quizData = quizRes.data;
                setQuiz(quizData);
                setQuestions(questionsRes.data);
                setTimeLeft(quizData.duration_minutes * 60);
            } catch (err) {
                toast.error('Failed to load quiz');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizData();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizId, navigate]);

    useEffect(() => {
        if (timeLeft > 0 && !quizFinished) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, quizFinished]);

    const handleOptionSelect = (questionId, optionValue) => {
        setAnswers({ ...answers, [questionId]: optionValue });
    };

    const handleShortAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const handleSubmit = async () => {
        if (isSubmitting || quizFinished) return;
        setIsSubmitting(true);
        try {
            const { data } = await api.post('/attempts', { quiz_id: quizId, answers });
            setScore(data.score);
            setQuizFinished(true);
            toast.success('Quiz submitted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <p className="text-gray-500 font-medium">Preparing your quiz...</p>
            </div>
        );
    }

    if (quizFinished) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Quiz Completed!</h1>
                    <p className="text-gray-500 mb-8 text-lg">Well done on finishing the assessment.</p>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 mb-8 border border-gray-100 dark:border-gray-800">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Your Score</div>
                        <div className="text-6xl font-black text-primary">{score}</div>
                    </div>

                    <button
                        onClick={() => navigate(`/student/subjects/${quiz.subject_id}`)}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        Back to Subject
                    </button>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* Quiz Header */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1">
                            {isTamil ? (quiz?.title_ta || quiz?.title) : quiz?.title}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black tabular-nums transition-colors ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                        <Clock size={18} />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Quiz Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 min-h-[400px] flex flex-col">
                    <div className="flex-1">
                        <div className="mb-10">
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest mb-4">
                                Question {currentQuestionIndex + 1}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-snug">
                                {isTamil ? (currentQuestion.question_text_ta || currentQuestion.question_text) : currentQuestion.question_text}
                            </h1>
                        </div>

                        {currentQuestion.type === 'mcq' ? (
                            <div className="space-y-4">
                                {currentQuestion.options?.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                                        className={`w-full group flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left outline-none ${answers[currentQuestion.id] === option.value
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                            : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors ${answers[currentQuestion.id] === option.value
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-300 dark:border-gray-600 text-gray-400 group-hover:border-primary group-hover:text-primary'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="flex-1 font-bold text-lg text-gray-700 dark:text-gray-200">
                                            {option.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-4">
                                <textarea
                                    className="w-full p-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all min-h-[160px] font-medium text-lg"
                                    placeholder="Type your answer here..."
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleShortAnswerChange(currentQuestion.id, e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation Controls */}
                    <div className="mt-12 flex items-center justify-between gap-4">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="flex items-center gap-2 px-6 py-3 font-bold text-gray-500 hover:text-primary disabled:opacity-30 disabled:hover:text-gray-500 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 transform active:scale-95 transition-all outline-none"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                Submit Quiz
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-xl shadow-primary/30 transform active:scale-95 transition-all outline-none"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Status Bar */}
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-4">
                        <span>Grade {user?.grade} Student Assessment</span>
                        <span>•</span>
                        <span>LMS Secure Quiz Environment</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-orange-500">
                        <AlertTriangle size={14} />
                        Don't refresh the page
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default QuizPlayer;

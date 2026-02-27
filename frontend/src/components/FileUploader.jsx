import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, File, CheckCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FileUploader = ({ onUploadSuccess, subjectId, type }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [titleTa, setTitleTa] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!title) setTitle(selectedFile.name.split('.')[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !title) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('title_ta', titleTa);
        formData.append('subject_id', subjectId);
        if (type === 'pastpaper') formData.append('year', year);

        try {
            const endpoint = type === 'note' ? '/notes' : '/pastpapers';
            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('File uploaded successfully!');
            setFile(null);
            setTitle('');
            setTitleTa('');
            onUploadSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Upload {type === 'note' ? 'Note' : 'Past Paper'}</h3>
                <Upload className="text-primary" size={24} />
            </div>

            <div className="space-y-4">
                {/* Dropzone Placeholder / Input */}
                {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-500 font-medium">Click to select or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
                    </label>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <File size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Title (English)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                            placeholder="Enter title"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Title (Tamil - Optional)</label>
                        <input
                            type="text"
                            value={titleTa}
                            onChange={(e) => setTitleTa(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                            placeholder="தலைப்பை உள்ளிடவும்"
                        />
                    </div>
                </div>

                {type === 'pastpaper' && (
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5 ml-1">Year</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                        />
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={uploading || !file || !title}
                    className="w-full flex items-center justify-center gap-2 py-4 mt-2 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 transition-all outline-none"
                >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                </button>
            </div>
        </div>
    );
};

export default FileUploader;

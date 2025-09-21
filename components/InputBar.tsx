import React, { useState, useRef, useCallback } from 'react';
import type { UploadedFile } from '../types';
import { SendIcon, PaperclipIcon, XIcon } from './icons';

interface InputBarProps {
    onSendMessage: (text: string, file: UploadedFile | null) => void;
    isLoading: boolean;
}

const SUPPORTED_MIME_TYPES_MAP: Record<string, string[]> = {
    'application/pdf': ['.pdf'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt'],
    'application/rtf': ['.rtf'],
    'text/rtf': ['.rtf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/webp': ['.webp'],
};

const getFileDetails = (file: File): { supported: boolean; mimeType: string } => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (file.type && SUPPORTED_MIME_TYPES_MAP[file.type]) {
        return { supported: true, mimeType: file.type };
    }
    for (const [mime, extensions] of Object.entries(SUPPORTED_MIME_TYPES_MAP)) {
        if (extensions.includes(extension)) {
            return { supported: true, mimeType: mime };
        }
    }
    return { supported: false, mimeType: file.type || 'application/octet-stream' };
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<UploadedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const { supported, mimeType } = getFileDetails(selectedFile);

            if (!supported) {
                const supportedExtensions = Object.values(SUPPORTED_MIME_TYPES_MAP).flat().join(', ');
                alert(`Formati i skedarit nuk mbështetet. Ju lutem ngarkoni një nga këto formate: ${supportedExtensions}`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            try {
                const base64 = await fileToBase64(selectedFile);
                setFile({
                    name: selectedFile.name,
                    type: mimeType,
                    base64: base64,
                });
            } catch (error) {
                console.error("Error converting file to base64", error);
            }
        }
    };

    const handleSendMessageClick = () => {
        if ((!text.trim() && !file) || isLoading) return;
        onSendMessage(text, file);
        setText('');
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessageClick();
        }
    };
    
    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };
    
    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4">
            {file && (
                <div className="mb-2 p-2 bg-slate-100 border border-slate-300 rounded-md flex items-center justify-between text-sm">
                    <span className="truncate pr-2">{file.name}</span>
                    <button onClick={handleRemoveFile} disabled={isLoading} className="p-1 rounded-full hover:bg-slate-200 disabled:opacity-50">
                        <XIcon className="w-4 h-4 text-slate-600" />
                    </button>
                </div>
            )}
            <div className={`relative flex items-end bg-white rounded-xl shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2`}>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder={"Më shkruani pyetjen tuaj... (p.sh. 'Më trego si të bëj një t-test')"}
                    className="w-full pl-12 pr-24 py-3 bg-transparent border-none resize-none focus:ring-0 text-slate-800 placeholder-slate-400 disabled:bg-slate-100/50"
                    rows={1}
                    style={{ maxHeight: '200px' }}
                />
                <div className="absolute left-3 bottom-2.5 flex items-center">
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        aria-label="Bashkëngjit skedar"
                    >
                        <PaperclipIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                        accept={Object.values(SUPPORTED_MIME_TYPES_MAP).flat().join(',')}
                    />
                </div>
                 <div className="absolute right-2 bottom-2 flex items-center">
                    <button
                        onClick={handleSendMessageClick}
                        disabled={isLoading || (!text.trim() && !file)}
                        className="p-2 bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-full transition-all duration-200 enabled:hover:scale-110 enabled:hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Dërgo mesazhin"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

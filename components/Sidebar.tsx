import React, { useState, useRef, useEffect } from 'react';
import type { ChatSession } from '../types';
import { PlusIcon, MessageIcon, InfoIcon, EditIcon, TrashIcon, CheckIcon, QuestionIcon } from './icons';

interface SidebarProps {
    chats: ChatSession[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onOpenAbout: () => void;
    onOpenFaq: () => void;
    onClearChatMessages: (id: string) => void;
    onUpdateChatTitle: (id: string, newTitle: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    chats, 
    activeChatId, 
    onNewChat, 
    onSelectChat, 
    onOpenAbout, 
    onOpenFaq, 
    onClearChatMessages, 
    onUpdateChatTitle 
}) => {
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingChatId && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingChatId]);

    const handleStartEdit = (chat: ChatSession) => {
        setEditingChatId(chat.id);
        setNewTitle(chat.title);
    };

    const handleCancelEdit = () => {
        setEditingChatId(null);
        setNewTitle('');
    };

    const handleSaveTitle = () => {
        if (editingChatId && newTitle.trim()) {
            onUpdateChatTitle(editingChatId, newTitle.trim());
        }
        handleCancelEdit();
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSaveTitle();
        } else if (event.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleClearMessagesWithConfirmation = (chatId: string) => {
        if (window.confirm("Jeni i sigurt që doni të fshini mesazhet e kësaj bisede?")) {
            onClearChatMessages(chatId);
        }
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 animate-slide-in-left">
            <div className="p-4 border-b border-slate-200">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-br from-green-600 to-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-teal-800 transition-all duration-300"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Bisedë e re</span>
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Historiku</h3>
                <ul className="space-y-1">
                    {chats.map(chat => (
                        <li key={chat.id} className="relative group">
                            {editingChatId === chat.id ? (
                                <div className="flex items-center space-x-2 p-2 bg-white border border-green-500 rounded-lg">
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleCancelEdit}  // FIX: mos bëj auto-save në blur
                                        className="flex-1 w-full bg-transparent focus:outline-none text-sm text-slate-800"
                                    />
                                    <button 
                                        onClick={handleSaveTitle} 
                                        className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => onSelectChat(chat.id)}
                                    className={`w-full text-left flex items-center space-x-3 p-2.5 rounded-lg text-sm transition-all duration-200 pr-16 ${
                                        activeChatId === chat.id 
                                        ? 'bg-green-700 text-white font-semibold shadow' 
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                    }`}
                                >
                                    <MessageIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="truncate flex-1">{chat.title}</span>
                                </button>
                            )}

                            {editingChatId !== chat.id && (
                               <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button 
                                        onClick={() => handleStartEdit(chat)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-full"
                                        aria-label="Edito titullin"
                                    >
                                        <EditIcon className="w-4 h-4"/>
                                    </button>
                                     <button 
                                        onClick={() => handleClearMessagesWithConfirmation(chat.id)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full"
                                        aria-label="Pastro mesazhet"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                               </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-3 border-t border-slate-200 space-y-1">
                 <button 
                    onClick={onOpenAbout}
                    className="w-full flex items-center space-x-3 text-sm font-medium text-slate-600 hover:text-green-700 transition-colors p-2 rounded-md hover:bg-slate-100"
                    aria-label="Rreth nesh dhe udhëzime"
                >
                    <InfoIcon className="h-5 w-5" />
                    <span>Rreth Nesh & Udhëzime</span>
                </button>
                 <button 
                    onClick={onOpenFaq} 
                    className="w-full flex items-center space-x-3 text-sm font-medium text-slate-600 hover:text-green-700 transition-colors p-2 rounded-md hover:bg-slate-100"
                    aria-label="Pyetjet më të shpeshta"
                >
                    <QuestionIcon className="h-5 w-5" />
                    <span>FAQ – Pyetjet më të shpeshta</span>
                </button>
            </div>
        </aside>
    );
};

import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { Message } from './Message';
import { SPSSAcademyLogo } from './icons';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

const TypingIndicator = () => (
    <div className="flex justify-start items-end space-x-3 animate-fade-in-up">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
            <SPSSAcademyLogo className="w-7 h-7 text-green-700" />
        </div>
        <div className="p-4 bg-white rounded-2xl rounded-bl-none border border-slate-200 shadow-md flex items-center space-x-1.5">
            <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0s' }}></span>
            <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0.2s' }}></span>
            <span className="animate-pulse block w-2.5 h-2.5 bg-slate-400 rounded-full" style={{ animationDelay: '0.4s' }}></span>
        </div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-main-gradient">
            <div className="max-w-5xl mx-auto space-y-6">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                {isLoading && messages.length > 0 && messages[messages.length-1]?.role === 'model' && (
                    <TypingIndicator />
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
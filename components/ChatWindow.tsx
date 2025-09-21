import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { Message } from './Message';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="relative flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
            <ul className="statistical-symbols" aria-hidden="true">
                <li>Σ</li>
                <li>β</li>
                <li>α</li>
                <li>μ</li>
                <li>χ²</li>
                <li>📈</li>
                <li>📊</li>
                <li>σ</li>
                <li>ρ</li>
                <li>∫</li>
            </ul>
            <div className="relative z-10 max-w-5xl mx-auto space-y-6">
                {messages.map((msg, index) => (
                    <Message 
                        key={msg.id} 
                        message={msg} 
                        isLastMessage={index === messages.length - 1}
                        isLoading={isLoading}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};
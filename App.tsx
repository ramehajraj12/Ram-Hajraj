import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai'; 
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { WelcomeScreen } from './components/WelcomeScreen';
// FIX: Import UploadedFile type.
import type { ChatMessage, ChatSession, UploadedFile } from './types';
import { initChat, sendMessageStream } from './services/geminiService';
import { Header } from './components/Header';
import { AboutModal } from './components/AboutModal';
import { Sidebar } from './components/Sidebar';
import * as chatHistoryService from './services/chatHistoryService';
import { FAQModal } from './components/FAQModal';

const App: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        const savedChats = chatHistoryService.getChats();
        setChats(savedChats);
    }, []);

    useEffect(() => {
        if (activeChatId) {
            const activeChat = chats.find(c => c.id === activeChatId);
            if (activeChat) {
                setMessages(activeChat.messages);
                chatRef.current = initChat(activeChat.messages);
            }
        } else {
            setMessages([]);
            chatRef.current = initChat([]);
        }
    }, [activeChatId, chats]);

    const handleSendMessage = useCallback(async (text: string, file: UploadedFile | null) => {
        if (!text.trim() && !file) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage: ChatMessage = { 
            id: Date.now().toString(),  // FIX: id si string
            role: 'user', 
            text, 
            file 
        };
        
        let currentChatId = activeChatId;

        if (!currentChatId) {
            const newChat: ChatSession = {
                id: `chat_${Date.now()}`,
                title: text.substring(0, 40) + (text.length > 40 ? '...' : ''),
                messages: [],
            };
            currentChatId = newChat.id;
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
            chatRef.current = initChat(); 
        }
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);

        const botMessage: ChatMessage = { 
            id: (Date.now() + 1).toString(), // FIX: id si string
            role: 'model', 
            text: '', 
            sources: [] 
        };
        setMessages(prev => [...prev, botMessage]);

        try {
            const stream = await sendMessageStream(chatRef.current!, text, file);
            let fullResponse = '';
            let lastChunk: any = null; // FIX: tipi i qartë

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                lastChunk = chunk; 
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === botMessage.id ? { ...msg, text: fullResponse } : msg
                    )
                );
            }
            
            const sources = lastChunk?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];

            botMessage.text = fullResponse;
            botMessage.sources = sources;
            
            const finalMessages = [...updatedMessages, botMessage];

            setChats(prevChats => {
                const newChats = prevChats.map(c => 
                    c.id === currentChatId 
                        ? { 
                            ...c, 
                            messages: finalMessages, 
                            title: c.messages.length === 0 
                                ? text.substring(0, 40) + (text.length > 40 ? '...' : '') 
                                : c.title 
                          } 
                        : c
                );
                chatHistoryService.saveChats(newChats);
                return newChats;
            });

        } catch (e: any) {
            const errorMessage = "Ndodhi një gabim gjatë marrjes së përgjigjes. Ju lutem provoni përsëri.";
            
            console.error(e);
            setError(errorMessage);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMessage.id ? { ...msg, text: errorMessage, isError: true } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }, [activeChatId, chats, messages]);
    
    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
        chatRef.current = initChat();
    };

    const handleClearChatMessages = (chatId: string) => {
        const updatedChats = chats.map(c =>
            c.id === chatId ? { ...c, messages: [] } : c
        );
        setChats(updatedChats);
        chatHistoryService.saveChats(updatedChats);
        if (activeChatId === chatId) {
            setMessages([]);
        }
    };

    const handleUpdateChatTitle = (chatId: string, newTitle: string) => {
        const updatedChats = chats.map(c => 
            c.id === chatId ? { ...c, title: newTitle } : c
        );
        setChats(updatedChats);
        chatHistoryService.saveChats(updatedChats);
    };

    return (
        <div className="flex flex-col h-screen font-sans bg-slate-50 text-slate-800">
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <FAQModal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} />
            <Header />
            <div className="flex-1 overflow-hidden flex">
                 <Sidebar 
                    chats={chats}
                    activeChatId={activeChatId}
                    onNewChat={handleNewChat}
                    onSelectChat={setActiveChatId}
                    onOpenAbout={() => setIsAboutModalOpen(true)}
                    onOpenFaq={() => setIsFaqModalOpen(true)}
                    onClearChatMessages={handleClearChatMessages}
                    onUpdateChatTitle={handleUpdateChatTitle}
                />
                <div className="flex flex-col flex-1">
                    <main className="flex-1 overflow-hidden flex flex-col">
                        {messages.length === 0 ? (
                            <WelcomeScreen />
                        ) : (
                            <ChatWindow messages={messages} isLoading={isLoading} />
                        )}
                    </main>
                    <footer className="bg-transparent p-4">
                        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
                        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                        <p className="text-xs text-slate-500 font-medium text-center mt-3 max-w-4xl mx-auto">
                           Mentori është gjithmonë i gatshëm t'ju udhëheqë me saktësi dhe integritet akademik. Bëni pyetjen tuaj për të filluar.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default App;

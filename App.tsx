import React, { useState, useEffect, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import type { ChatMessage, ChatSession, UploadedFile } from './types';
import { sendMessageStream } from './services/geminiService';
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
    
    useEffect(() => {
        const savedChats = chatHistoryService.getChats();
        setChats(savedChats);
        const lastActiveId = localStorage.getItem('spss_last_active_chat_id');
        if (lastActiveId && savedChats.some(c => c.id === lastActiveId)) {
            setActiveChatId(lastActiveId);
        }
    }, []);

    useEffect(() => {
        // Prevent state overwrite during streaming response
        if (isLoading) return;

        const activeChat = chats.find(c => c.id === activeChatId);
        if (activeChat) {
            setMessages(activeChat.messages);
        } else {
            setMessages([]);
        }
    }, [activeChatId, chats, isLoading]);

    const handleSendMessage = useCallback(async (text: string, file: UploadedFile | null) => {
        if (!text.trim() && !file) return;

        setIsLoading(true);
        setError(null);
        
        const userMessage: ChatMessage = { id: Date.now(), role: 'user', text, file };
        
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
            localStorage.setItem('spss_last_active_chat_id', newChat.id);
        }
        
        const messagesWithUser = [...messages, userMessage];
        const botMessage: ChatMessage = { id: Date.now() + 1, role: 'model', text: '', sources: [] };
        setMessages([...messagesWithUser, botMessage]);


        try {
            const stream = await sendMessageStream(messagesWithUser);
            let fullResponse = '';
            let lastChunk = null;

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

            const finalBotMessage = { ...botMessage, text: fullResponse, sources };
            
            const finalMessages = [...messagesWithUser, finalBotMessage];
            
            // FIX: Explicitly set the final message state to guarantee UI update
            setMessages(finalMessages);

            setChats(prevChats => {
                const newChats = prevChats.map(c => 
                    c.id === currentChatId ? { ...c, messages: finalMessages, title: c.messages.length === 0 ? text.substring(0, 40) + (text.length > 40 ? '...' : '') : c.title } : c
                );
                chatHistoryService.saveChats(newChats);
                return newChats;
            });

        } catch (e: any) {
            console.error("Gabim gjatë dërgimit të mesazhit:", e);
            const displayError = (e instanceof Error) ? e.message : "Ndodhi një gabim i panjohur. Ju lutem provoni përsëri.";
            setError(displayError);

            const errorBotMessage = { ...botMessage, text: displayError, isError: true };
            const finalMessagesWithError = [...messagesWithUser, errorBotMessage];
            
            // Update the UI with the error
            setMessages(finalMessagesWithError);
            
            // Persist the error to chat history
            setChats(prevChats => {
                const newChats = prevChats.map(c => 
                    c.id === currentChatId ? { ...c, messages: finalMessagesWithError } : c
                );
                chatHistoryService.saveChats(newChats);
                return newChats;
            });
        } finally {
            setIsLoading(false);
        }
    }, [activeChatId, chats, messages]);
    
    const handleNewChat = () => {
        setActiveChatId(null);
        localStorage.removeItem('spss_last_active_chat_id');
        setMessages([]);
    };

    const handleSelectChat = (id: string) => {
        setActiveChatId(id);
        localStorage.setItem('spss_last_active_chat_id', id);
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
        const updatedChats = chats.map(c => c.id === chatId ? {...c, title: newTitle } : c);
        setChats(updatedChats);
        chatHistoryService.saveChats(updatedChats);
    };

    return (
        <div className="flex flex-col h-screen font-sans bg-slate-50 text-slate-800">
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <FAQModal isOpen={isFaqModalOpen} onClose={() => setIsFaqModalOpen(false)} />
            <Header onOpenAbout={() => setIsAboutModalOpen(true)} onOpenFaq={() => setIsFaqModalOpen(true)} />
            <div className="flex-1 overflow-hidden flex">
                 <Sidebar 
                    chats={chats}
                    activeChatId={activeChatId}
                    onNewChat={handleNewChat}
                    onSelectChat={handleSelectChat}
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
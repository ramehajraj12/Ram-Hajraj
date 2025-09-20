import type { ChatSession } from '../types';

const CHAT_HISTORY_KEY = 'spss_talk_chat_history';

/**
 * Retrieves the list of chat sessions from local storage.
 * @returns {ChatSession[]} An array of chat sessions.
 */
export const getChats = (): ChatSession[] => {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
};

/**
 * Saves the list of chat sessions to local storage.
 * @param {ChatSession[]} chats - The array of chat sessions to save.
 */
export const saveChats = (chats: ChatSession[]) => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chats));
};

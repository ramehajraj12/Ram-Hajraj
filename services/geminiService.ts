import { GoogleGenAI } from '@google/genai';
import type { Chat, Part, Content, GenerateContentResponse } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import type { UploadedFile, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildHistory = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
        // Filter out file property from model messages as model can't "send" files
        if (msg.role === 'model') {
            return {
                role: 'model',
                parts: [{ text: msg.text }]
            }
        }

        const parts: Part[] = [{ text: msg.text }];
        if (msg.file) {
            parts.unshift({
                inlineData: {
                    mimeType: msg.file.type,
                    data: msg.file.base64,
                }
            });
        }
        return {
            role: 'user',
            parts,
        };
    });
};

export const initChat = (history: ChatMessage[] = []): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: buildHistory(history),
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{googleSearch: {}}],
        },
    });
};

export const sendMessageStream = async (chat: Chat, text: string, file: UploadedFile | null): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const parts: Part[] = [];

    if (file) {
        parts.push({
            inlineData: {
                mimeType: file.type,
                data: file.base64,
            },
        });
    }

    if (text) {
        parts.push({ text });
    }
    
    if (parts.length === 0) {
        throw new Error("Cannot send an empty message.");
    }

    // FIX: The `sendMessageStream` method expects an object with a `message` property, which contains the array of parts.
    const resultStream = await chat.sendMessageStream({ message: parts });
    return resultStream;
};

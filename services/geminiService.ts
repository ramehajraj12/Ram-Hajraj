import { GoogleGenAI } from '@google/genai';
import type { Chat, Part, Content, GenerateContentResponse } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import type { UploadedFile, ChatMessage } from '../types';

let ai: GoogleGenAI | null = null;
export let apiKeyError: string | null = null;
let isInitialized = false;

export function initializeGeminiClient(key: string): boolean {
    if (!key || typeof key !== 'string' || key.trim() === '') {
        isInitialized = false;
        apiKeyError = "API Key i dhënë është i pavlefshëm.";
        return false;
    }
    try {
        const client = new GoogleGenAI({ apiKey: key });
        ai = client;
        isInitialized = true;
        apiKeyError = null;
        return true;
    } catch (e) {
        console.error("Dështoi krijimi i klientit GoogleGenAI:", e);
        isInitialized = false;
        apiKeyError = "API Key i pavlefshëm ose gabim në konfigurim.";
        return false;
    }
}

// Provo të inicializosh nga variabli i mjedisit në fillim
const envKey = process.env.API_KEY;
if (envKey) {
    initializeGeminiClient(envKey);
} else {
    apiKeyError = "Vërejtje: Konfigurimi i API Key mungon. Ju lutem, vendoseni për të aktivizuar funksionalitetin e plotë.";
}

const buildHistory = (messages: ChatMessage[]): Content[] => {
    return messages.map(msg => {
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

export const initChat = (history: ChatMessage[] = []): Chat | null => {
    if (!isInitialized || !ai) {
        console.error(apiKeyError || "Klienti i Gemini AI nuk është inicializuar.");
        return null;
    }
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
    if (!isInitialized) {
         throw new Error("Klienti i Gemini AI nuk është inicializuar.");
    }

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
        throw new Error("Nuk mund të dërgohet një mesazh bosh.");
    }

    const resultStream = await chat.sendMessageStream({ message: parts });
    return resultStream;
};
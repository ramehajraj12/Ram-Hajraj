import type { GroundingChunk } from '@google/genai';

export interface UploadedFile {
    name: string;
    type: string;
    base64: string;
}

export interface ChatMessage {
    id: number;
    role: 'user' | 'model';
    text: string;
    file?: UploadedFile | null;
    isError?: boolean;
    sources?: GroundingChunk[];
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

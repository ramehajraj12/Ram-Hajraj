import type { Part, GenerateContentResponse } from '@google/genai';
import type { UploadedFile, ChatMessage } from '../types';

async function* streamGenerator(stream: ReadableStream<Uint8Array>): AsyncGenerator<any> {
    const reader = stream.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                if (buffer.length > 0) {
                    try {
                        yield JSON.parse(buffer);
                    } catch (e) {
                        console.error("Mbetje JSON të pavlefshme në fund të transmetimit:", buffer, e);
                    }
                }
                break;
            }
            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("\n\n");
            buffer = parts.pop() || "";

            for (const part of parts) {
                 if (part.trim()) {
                    try {
                        yield JSON.parse(part);
                    } catch (e) {
                        console.error("Dështoi në analizimin e pjesës JSON:", part, e);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}


export const sendMessageStream = async (history: ChatMessage[], text: string, file: UploadedFile | null): Promise<AsyncGenerator<GenerateContentResponse>> => {

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
    
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            history: history.slice(0, -1), // Send history without the latest user message
            message: parts,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Gabim në rrjet: ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            // Përdorni mesazhin specifik të gabimit nga trupi JSON
            errorMessage = errorJson.error || errorJson.details || errorMessage;
        } catch (e) {
            // Nëse trupi nuk është JSON ose dështon, përdorni tekstin e papërpunuar nëse ekziston
            if (errorText) {
                errorMessage = errorText;
            }
        }
        throw new Error(errorMessage);
    }

    if (!response.body) {
        throw new Error("Përgjigja e transmetimit nuk ka trup.");
    }
    
    return streamGenerator(response.body);
};
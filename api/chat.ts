import { GoogleGenAI } from '@google/genai';
import type { Part, Content } from '@google/genai';
import type { ChatMessage } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Vercel specifik: Konfigurimi për të siguruar që funksioni është streaming.
export const config = {
  runtime: 'edge',
};

// Funksioni kryesor që Vercel do ta ekzekutojë
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Metoda nuk lejohet' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key nuk është konfiguruar në server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { history, message } = (await req.json()) as { history: ChatMessage[], message: Part[] };

    const ai = new GoogleGenAI({ apiKey });
    
    // Ndërtojmë historikun e plotë të bisedës
    const contents: Content[] = history.map(msg => {
        const parts: Part[] = [];
        if (msg.text) {
            parts.push({ text: msg.text });
        }
        if (msg.file) {
            parts.push({
                inlineData: {
                    mimeType: msg.file.type,
                    data: msg.file.base64,
                },
            });
        }
        return { role: msg.role, parts };
    });

    // Shtojmë mesazhin e ri të përdoruesit
    contents.push({
        role: 'user',
        parts: message,
    });
    
    // Përdorim metodën stateless `generateContentStream`
    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });

    // Krijimi i një transmetimi (stream) që mund t'i dërgohet klientit
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of resultStream) {
            const jsonChunk = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(jsonChunk + "\n\n"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    console.error("Gabim në anën e serverit:", error);
    const errorMessage = error.message || 'Detajet nuk janë të disponueshme.';
    return new Response(JSON.stringify({ error: `Gabim i brendshëm në server: ${errorMessage}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
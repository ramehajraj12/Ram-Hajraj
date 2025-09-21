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

    // Validim shtesë për të siguruar që mesazhi nuk është bosh
    if (!message || !Array.isArray(message) || message.length === 0 || message.every(part => !part.text && !part.inlineData)) {
        return new Response(JSON.stringify({ error: 'Mesazhi i përdoruesit është bosh ose i pavlefshëm.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // Ndërtojmë historikun e plotë të bisedës në mënyrë të sigurt
    const contents: Content[] = [
        // Rregullim Thelbësor: Kalojmë instruksionin si pjesë e historikut për stabilitet maksimal
        {
            role: 'user',
            parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        {
            role: 'model',
            parts: [{ text: "Unë jam Mentori. Si mund t'ju ndihmoj sot me SPSS, statistika ose metodologji kërkimore?" }],
        },
        ...history
            .filter(msg => (msg.role === 'user' || msg.role === 'model') && (msg.text?.trim() || msg.file))
            .map(msg => ({
                role: msg.role,
                parts: [
                    ...(msg.text ? [{ text: msg.text }] : []),
                    ...(msg.file ? [{ inlineData: { mimeType: msg.file.type, data: msg.file.base64 } }] : [])
                ]
            }))
            .filter(content => content.parts.length > 0)
    ];

    // Shtojmë mesazhin e ri të përdoruesit
    contents.push({
        role: 'user',
        parts: message,
    });
    
    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
    });

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
    console.error("Gabim i detajuar në server:", JSON.stringify(error, null, 2));
    const errorMessage = error.message || 'Detajet nuk janë të disponueshme.';
    const fullError = `Gabim i brendshëm në server: ${errorMessage}`;
    return new Response(JSON.stringify({ error: fullError }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
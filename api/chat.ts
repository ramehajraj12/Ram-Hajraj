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
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Lista e mesazheve është bosh ose e pavlefshme.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // Hapi 1: Filtro mesazhet e pavlefshme dhe konvertoji në strukturën bazë `Content`.
    const initialContents: Content[] = messages
      .filter(msg => !msg.isError && (msg.text?.trim() || msg.file))
      .map(msg => {
          const parts: Part[] = [];
          if (msg.text?.trim()) {
              parts.push({ text: msg.text });
          }
          if (msg.file) {
              parts.push({ inlineData: { mimeType: msg.file.type, data: msg.file.base64 } });
          }
          return { role: msg.role, parts };
      });

    // Hapi 2: Pastron historikun për të siguruar role alternative dhe për të bashkuar mesazhet e njëpasnjëshme.
    const sanitizedHistory: Content[] = [];
    if (initialContents.length > 0) {
      // Gjej mesazhin e parë të përdoruesit për të filluar bisedën.
      const firstUserIdx = initialContents.findIndex(c => c.role === 'user');

      if (firstUserIdx !== -1) {
        // Shto mesazhin e parë të përdoruesit
        sanitizedHistory.push(initialContents[firstUserIdx]);

        // Përpuno pjesën tjetër të mesazheve
        for (let i = firstUserIdx + 1; i < initialContents.length; i++) {
          const currentContent = initialContents[i];
          const lastContentInHistory = sanitizedHistory[sanitizedHistory.length - 1];

          // Nëse roli është i njëjtë me të fundit, bashko pjesët.
          if (currentContent.role === lastContentInHistory.role) {
            lastContentInHistory.parts.push(...currentContent.parts);
          } else {
            // Nëse roli është i ndryshëm, shtoje si një hyrje të re.
            sanitizedHistory.push(currentContent);
          }
        }
      }
    }
    const finalContents = sanitizedHistory;


    // Validimi final: Sigurohu që ka përmbajtje dhe mesazhi i fundit është nga përdoruesi.
    if (finalContents.length === 0 || finalContents[finalContents.length - 1].role !== 'user') {
        return new Response(JSON.stringify({ error: 'Përmbajtja e vlefshme për t\'u dërguar mungon ose biseda nuk përfundon me një mesazh përdoruesi.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: finalContents,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingBudget: 0 },
        }
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

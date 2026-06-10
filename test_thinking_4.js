import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function test() {
    let contents = [{ role: 'user', parts: [{ text: "Solve this riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?" }] }];
    
    try {
        let stream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash-thinking-exp-01-21",
            contents
        });
        
        for await (const chunk of stream) {
            if (chunk.parts) {
                for (let part of chunk.parts) {
                    if (part.thought) {
                        console.log("Thought:", part.text.slice(0, 50));
                    }
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();

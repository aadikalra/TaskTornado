import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function test() {
    let contents = [{ role: 'user', parts: [{ text: "Solve this riddle: I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?" }] }];
    
    try {
        let stream = await ai.models.generateContentStream({
            model: "gemma-4-26b-a4b-it",
            contents,
            config: {
                thinkingConfig: {
                    thinkingLevel: "low" // or ThinkingLevel.LOW
                }
            }
        });
        
        for await (const chunk of stream) {
            console.log("Chunk:", JSON.stringify(chunk, null, 2));
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();

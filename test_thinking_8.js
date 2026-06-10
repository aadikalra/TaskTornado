import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function test() {
    try {
        let stream = await ai.models.generateContentStream({
            model: "gemma-4-31b-it",
            contents: "hello",
            config: {
                thinkingConfig: {
                    thinkingLevel: "low"
                }
            }
        });
        
    } catch (e) {
        console.error("gemma-4-31b-it Error:", e.message);
    }
}
test();

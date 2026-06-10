import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function test() {
    try {
        let stream = await ai.models.generateContentStream({
            model: "gemini-2.5-pro",
            contents: "hello",
            config: {
                thinkingConfig: {
                    thinkingBudgetTokens: 1024
                }
            }
        });
        
    } catch (e) {
        console.error("gemini-2.5-pro Error:", e.message);
    }
}
test();

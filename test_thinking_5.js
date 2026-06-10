import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function test() {
    try {
        let stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: "hello",
            config: {
                thinkingConfig: {
                    thinkingBudgetTokens: 1024
                }
            }
        });
        
    } catch (e) {
        console.error("gemini-2.5-flash Error:", e.message);
    }

    try {
        let stream = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: "hello",
            config: {
                thinkingConfig: {
                    thinkingBudgetTokens: 1024
                }
            }
        });
        for await (const chunk of stream) {
            console.log(chunk);
            break;
        }
    } catch (e) {
        console.error("gemini-2.0-flash Error:", e.message);
    }
}
test();

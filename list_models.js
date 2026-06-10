import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function list() {
    let models = await ai.models.list();
    for await (const model of models) {
        if (model.name.includes("pro") || model.name.includes("flash") || model.name.includes("thinking") || model.name.includes("gemma")) {
            console.log(model.name);
        }
    }
}
list();

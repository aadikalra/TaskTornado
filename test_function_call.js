import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

const get_weather = {
    name: "get_weather",
    description: "Get current weather for a given location.",
    parameters: {
        type: "object",
        properties: {
            location: { type: "string" },
        },
        required: ["location"],
    },
};

async function test() {
    let contents = [{ role: 'user', parts: [{ text: "What's the weather in Seattle?" }] }];
    
    let response = await ai.models.generateContent({
        model: "gemma-4-26b-a4b-it",
        contents,
        config: { tools: [{ functionDeclarations: [get_weather] }] }
    });
    
    console.log("Model response function calls:", response.functionCalls);
    
    if (response.functionCalls) {
        // Append model response
        contents.push({
            role: "model",
            parts: response.functionCalls.map(fc => ({ functionCall: fc }))
        });
        
        // Append function response
        contents.push({
            role: "user", // or "function"? Let's try "user"
            parts: [{
                functionResponse: {
                    name: "get_weather",
                    response: { result: "It's raining." }
                }
            }]
        });
        
        console.log("Calling again with contents:", JSON.stringify(contents, null, 2));
        
        try {
            let response2 = await ai.models.generateContent({
                model: "gemma-4-26b-a4b-it",
                contents,
                config: { tools: [{ functionDeclarations: [get_weather] }] }
            });
            console.log("Final text:", response2.text);
        } catch (e) {
            console.error("Error on second call:", e);
        }
    }
}
test();

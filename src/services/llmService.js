import { GoogleGenAI } from "@google/genai";
import buildPrompt from '../utils/promptBuilder.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const getInterviewQuestions = async (skilsets, experience) => {
    const prompt = buildPrompt(skilsets, experience);

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: `You are a professional interview coach. ${prompt}` }]
                }
            ],
        });

        console.log("Response received from Gemini API");

        let responseText = "";
        if (result.candidates && result.candidates.length > 0) {
            responseText = result.candidates[0].content.parts[0].text;
            try {
                // Clean the response text (remove markdown code blocks if present)
                responseText = responseText.replace(/```json|```/g, '').trim();
                // Parse the JSON
                const parsedResponse = JSON.parse(responseText);
                return JSON.stringify(parsedResponse);
            } catch (parseError) {
                console.log("Failed to parse as JSON, returning raw text");
                return responseText;
            }
        } else {
            responseText = JSON.stringify(result);
        }

        return responseText;
    } catch (error) {
        console.error("Error details:", error);
        throw error;
    }
};

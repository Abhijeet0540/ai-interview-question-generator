import { GoogleGenAI } from "@google/genai";
import buildPrompt from '../utils/promptBuilder.js';
import { pool } from '../config/db.postgres.config.js';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const getInterviewQuestions = async (skillsets, experience) => {
    const prompt = buildPrompt(skillsets, experience);
    // LLM request to Gemini
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

        const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanedText = rawText.replace(/```json|```/g, '').trim();

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(cleanedText);
        } catch (error) {
            console.error("Invalid JSON format from Gemini:", error.message);
            return { error: "Invalid format from Gemini", raw: cleanedText };
        }

        // Insert questions into database and store their IDs
        if (Array.isArray(parsedResponse.questions)) {
            const skillsetString = Array.isArray(skillsets) ? skillsets.join(', ') : String(skillsets);

            let insertedCount = 0;
            const questionsWithDbIds = [];
            
            for (const q of parsedResponse.questions) {
                // Check if question already exists
                const checkResult = await pool.query(
                    `SELECT id FROM interview_questions WHERE question = $1 AND skillset = $2 AND experience_level = $3`,
                    [q.question, skillsetString, experience]
                );

                let questionId;
                
                if (checkResult.rows.length === 0) {
                    // Insert new question into database
                    const insertResult = await pool.query(
                        `INSERT INTO interview_questions (question, category, type, skillset, experience_level) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                        [q.question, q.category, q.type, skillsetString, experience]
                    );
                    questionId = insertResult.rows[0].id;
                    insertedCount++;
                } else {
                    // Use existing question ID
                    questionId = checkResult.rows[0].id;
                    console.log("Duplicate question found with ID:", questionId);
                }
                
                // Add database ID to the question object
                questionsWithDbIds.push({
                    ...q,
                    id: questionId
                });
            }

            console.log(`${insertedCount} new questions inserted into the database ✅ ${parsedResponse.questions.length} total questions`);
            
            // Replace the questions array with the one containing database IDs
            parsedResponse.questions = questionsWithDbIds;
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error generating interview qauestions:", error);
        throw error;
    }
};

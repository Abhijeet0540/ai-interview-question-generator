import { GoogleGenAI } from "@google/genai";
import { pool } from '../config/db.postgres.config.js';
import buildEvaluationPrompt from '../utils/promptEvaluation.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const evaluateAnswer = async (questionId, userAnswer) => {
  try {
    // Get the question from the database
    const { rows } = await pool.query(
      'SELECT question, category, type FROM interview_questions WHERE id = $1',
      [questionId]
    );

    if (rows.length === 0) {
      throw new Error('Question not found');
    }

    const questionData = rows[0];

    // Use Gemini to evaluate the answer
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: buildEvaluationPrompt(questionData, userAnswer) }]
        }
      ],
    });

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanedText = rawText.replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Invalid JSON format from Gemini:", error.message);
      return {
        isCorrect: false,
        score: 0,
        feedback: "Could not evaluate answer"
      };
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
};



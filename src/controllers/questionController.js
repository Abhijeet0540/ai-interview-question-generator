import { getInterviewQuestions } from '../services/llmService.js';
import { getAnswersForSession } from '../services/dbService.js';

export const genrateQuestions = async (req, res) => {
    try {
        const { skilsets, experience } = req.body;
        
        // Validate input
        if (!skilsets || !Array.isArray(skilsets) || skilsets.length === 0) {
            return res.status(400).json({ error: 'Skillsets must be a non-empty array' });
        }
        
        if (!experience || typeof experience !== 'string') {
            return res.status(400).json({ error: 'Experience level is required' });
        }
        
        const questions = await getInterviewQuestions(skilsets, experience);

        res.status(200).json({
            total: questions.questions?.length || 0,
            questions
        });
    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
};

export const getSessionResults = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }
        
        const results = await getAnswersForSession(sessionId);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No results found for this session' });
        }
        
        // Calculate overall score
        let totalScore = 0;
        const formattedResults = results.map(result => {
            totalScore += result.score || 0;
            return {
                question: result.question,
                userAnswer: result.user_answer,
                isCorrect: result.is_correct,
                score: result.score || 0,
                feedback: result.feedback || ''
            };
        });
        
        const averageScore = results.length > 0 ? totalScore / results.length : 0;
        
        res.status(200).json({
            sessionId,
            totalQuestions: results.length,
            averageScore,
            results: formattedResults
        });
    } catch (error) {
        console.error('Error fetching session results:', error.message);
        res.status(500).json({ error: 'Failed to fetch session results' });
    }
};

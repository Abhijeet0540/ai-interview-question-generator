import { getInterviewQuestions } from '../services/llmService.js';

export const genrateQuestions = async (req, res) => {
    const { skilsets, experience } = req.body;
    try {
        if (!skilsets || !experience) {
            return res.status(400).json({ error: 'Please provide skilsets and experience' });
        }
        else {
            const questions = await getInterviewQuestions(skilsets, experience);
            
            const parsedQuestions = JSON.parse(questions);
            res.status(200).json({
                total: parsedQuestions.interview_questions ? parsedQuestions.interview_questions.length : 0,
                questions: parsedQuestions
            });
        }
    }
    catch (error) {
        console.error('Error generating questions:', error.message);
        res.status(500).json({ error: 'Failed to generate interview questions' });
    }
};



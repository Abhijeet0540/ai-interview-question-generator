import { getInterviewQuestions } from '../services/llmService.js';
import { getAnswersForSession, getUniqueSkillsets, getSessionSkillset } from '../services/dbService.js';
import { pool } from '../config/db.postgres.config.js';

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

// Debug endpoint to list all sessions
export const listAllSessions = async (req, res) => {
    try {
        // Query to get all distinct session IDs with their question counts
        const query = `
            SELECT
                session_id,
                COUNT(*) as answer_count,
                MAX(created_at) as last_updated
            FROM
                user_answers
            GROUP BY
                session_id
            ORDER BY
                last_updated DESC
            LIMIT 20
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No sessions found in the database',
                sessions: []
            });
        }

        res.status(200).json({
            total: result.rows.length,
            sessions: result.rows
        });
    } catch (error) {
        console.error('Error listing sessions:', error.message);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
};

export const getSessionsWithSkillsets = async (req, res) => {
    try {
        // Query to get all distinct session IDs with their question counts
        const sessionsQuery = `
            SELECT
                session_id,
                COUNT(*) as answer_count,
                MAX(created_at) as last_updated
            FROM
                user_answers
            GROUP BY
                session_id
            ORDER BY
                last_updated DESC
            LIMIT 20
        `;

        const sessionsResult = await pool.query(sessionsQuery);

        if (sessionsResult.rows.length === 0) {
            return res.status(404).json({
                message: 'No sessions found in the database',
                sessions: []
            });
        }

        // Enhance sessions with skillset information
        const enhancedSessions = await Promise.all(
            sessionsResult.rows.map(async (session) => {
                const skillset = await getSessionSkillset(session.session_id);
                return {
                    ...session,
                    skillset
                };
            })
        );

        res.status(200).json({
            total: enhancedSessions.length,
            sessions: enhancedSessions
        });
    } catch (error) {
        console.error('Error listing sessions with skillsets:', error.message);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
};

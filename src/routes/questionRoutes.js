import express from 'express';
import { genrateQuestions, getSessionsWithSkillsets } from '../controllers/questionController.js';
import { generateAudio, processUserSpeech } from '../controllers/audioController.js';
import { getSessionResults, listAllSessions } from '../controllers/questionController.js';

const router = express.Router();

router.post('/', genrateQuestions);
router.post('/audio', generateAudio);
router.post('/speech/:questionId', processUserSpeech);
router.get('/results/:sessionId', getSessionResults);
router.get('/debug/sessions', listAllSessions);
router.get('/sessions-with-skillsets', getSessionsWithSkillsets);

export default router;


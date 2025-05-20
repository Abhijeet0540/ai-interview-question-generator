import express from 'express';
import { genrateQuestions } from '../controllers/questionController.js';
import { generateAudio, processUserSpeech } from '../controllers/audioController.js';
import { getSessionResults } from '../controllers/questionController.js';

const router = express.Router();

router.post('/', genrateQuestions);
router.post('/audio', generateAudio);
router.post('/speech/:questionId', processUserSpeech);
router.get('/results/:sessionId', getSessionResults);

export default router;

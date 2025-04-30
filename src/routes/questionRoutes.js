import express from 'express';
import { genrateQuestions } from '../controllers/questionController.js';
const router = express.Router();


router.post('/', genrateQuestions);


export default router;
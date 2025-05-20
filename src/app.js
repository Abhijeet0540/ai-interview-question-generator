import express from 'express';
import dotenv from 'dotenv';
import questionRoutes from './routes/questionRoutes.js';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());

// Increase JSON payload limit to handle large audio files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('__public'));
app.use(express.static('views'));
app.set('view engine', 'ejs');

// Add a route to render the questions page
app.get('/', (req, res) => { res.render('questions'); });

app.use('/api/questions', questionRoutes);

export default app;




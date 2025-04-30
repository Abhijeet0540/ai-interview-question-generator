import express from 'express';
import dotenv from 'dotenv';
import questionRoutes from './routes/questionRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('views'));


app.use('/api/questions', questionRoutes);

export default app;

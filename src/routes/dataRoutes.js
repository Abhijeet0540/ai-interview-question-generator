import express from 'express';
import { getAllData, getDataById } from '../controllers/dataController.js';

const router = express.Router();

// Get all records from a table
router.get('/:table', getAllData);

// Get a specific record by ID
router.get('/:table/:id', getDataById);

export default router;
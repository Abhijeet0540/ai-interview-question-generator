import { pool } from '../config/db.postgres.config.js';

export const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const fetchAll = async (table) => {
  console.log(`Attempting to fetch all records from table: ${table}`);
  try {
    const result = await query(`SELECT * FROM ${table}`);
    console.log(`Fetched ${result.length} records from ${table}`);
    return result;
  } catch (error) {
    console.error(`Database error when fetching from ${table}:`, error);
    throw error;
  }
};


export const fetchById = async (table, id) => {
  console.log(`Attempting to fetch record with id ${id} from table: ${table}`);
  try {
    const result = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    console.log(`Fetch by ID result:`, result);
    return result;
  } catch (error) {
    console.error(`Database error when fetching id ${id} from ${table}:`, error);
    throw error;
  }
};

// Save user answer 
export const saveUserAnswer = async (questionId, userAnswer, isCorrect, sessionId, score, feedback) => {
  try {
    console.log(`Saving answer for question ${questionId}, session ${sessionId}`);
    console.log(`Answer: ${userAnswer.substring(0, 50)}...`);
    console.log(`Is correct: ${isCorrect}, Score: ${score}`);
    
    const query = `
      INSERT INTO user_answers 
      (question_id, user_answer, is_correct, session_id, score, feedback) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING id
    `;
    
    const values = [questionId, userAnswer, isCorrect, sessionId, score, feedback];
    
    const result = await pool.query(query, values);
    console.log(`Answer saved with ID: ${result.rows[0].id}`);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving user answer:', error);
    throw error;
  }
};

export const getAnswersForSession = async (sessionId) => {
  try {
    console.log(`Fetching answers for session ${sessionId}`);
    
    const query = `
      SELECT 
        q.question, 
        ua.user_answer, 
        ua.is_correct, 
        ua.score, 
        ua.feedback 
      FROM 
        user_answers ua
      JOIN 
        interview_questions q ON ua.question_id = q.id
      WHERE 
        ua.session_id = $1
      ORDER BY 
        ua.id ASC
    `;
    
    const result = await pool.query(query, [sessionId]);
    console.log(`Found ${result.rows.length} answers for session ${sessionId}`);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching answers for session:', error);
    throw error;
  }
};




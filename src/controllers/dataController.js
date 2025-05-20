import * as dbService from '../services/dbService.js';

export const getAllData = async (req, res) => {
  try {
    const { table } = req.params;
    const data = await dbService.fetchAll(table);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
};

export const getDataById = async (req, res) => {
  try {
    const { table, id } = req.params;
    const data = await dbService.fetchById(table, id);

    if (data.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error fetching data by ID:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
};

export const testDbConnection = async (req, res) => {
  try {
    const result = await dbService.query('SELECT NOW() as current_time');
    res.status(200).json({ 
      message: 'Database connection successful',
      time: result[0].current_time,
      dbConfig: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message
    });
  }
};


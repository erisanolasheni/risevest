import { Pool } from 'pg';
import { env } from 'custom-env';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

env();

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.DB_PORT) || 5432
});

const loadSchema = async () => {
  const schemaPath = path.join(__dirname, '../sql/schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schemaSQL);
    logger.info('Database schema loaded successfully.');
  } catch (error) {
    logger.error('Error loading database schema:', error);
  }
};

export const connectDB = async () => {
  try {
    await pool.connect();
    logger.info('Connected to the database');
    await loadSchema();
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    throw new Error('Database connection failed');
  }
};

export { pool };

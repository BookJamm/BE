import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.type';

export default registerAs<DatabaseConfig>('db', () => ({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  database: process.env.DB_NAME || 'bookjam',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  maxConnections: 100,
}));

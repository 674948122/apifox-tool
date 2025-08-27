/**
 * This is a API server
 */

import express, { type Request, type Response, type NextFunction }  from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import { parseJavaCode, validateJavaCode } from './routes/parse';
import { getExamples, getExampleById_API, createExample, getExampleStats } from './routes/examples';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env
dotenv.config();


const app: express.Application = express();

app.use(cors({
  origin: true, // 允许所有源访问，支持局域网IP
  credentials: true // 允许携带凭证
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);

// Java解析相关路由
app.post('/api/parse', parseJavaCode);
app.post('/api/validate', validateJavaCode);

// 示例相关路由
app.get('/api/examples', getExamples);
app.get('/api/examples/stats', getExampleStats);
app.get('/api/examples/:id', getExampleById_API);
app.post('/api/examples', createExample);

/**
 * health
 */
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      parser: 'active',
      converter: 'active',
      examples: 'active'
    }
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default app;
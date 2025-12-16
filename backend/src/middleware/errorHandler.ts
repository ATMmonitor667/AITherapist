import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export class AppError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isDev ? err.message : 'Internal server error',
    },
    timestamp: new Date().toISOString(),
  });
}


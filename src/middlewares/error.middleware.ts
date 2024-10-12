import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError, DatabaseError } from '../utils/logger';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    let status = 500;
    let message = 'Internal Server Error';

    if (err instanceof ApiError) {
        status = err.statusCode;
        message = err.message;
    } else if (err instanceof DatabaseError) {
        status = 500;
        message = 'Database error occurred';
    } else if (err.status) {
        status = err.status;
        message = err.message || message;
    }

    const response = {
        status,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(status).json(response);
};

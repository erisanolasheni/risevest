import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from "custom-env";
import { errorMiddleware } from './middlewares/error.middleware';
import { createApiRoutes } from './routes/index.routes';
import { connectDB, pool } from './config/database';
import { redisClient } from './config/redis';
import { logger, DatabaseError } from './utils/logger';


env();

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeConnections();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        this.app.use(process.env.API_PREFIX || '/api/v1', createApiRoutes(pool));
    }

    private initializeErrorHandling(): void {
        this.app.use(errorMiddleware);
    }

    private async initializeConnections(): Promise<void> {
        try {
            await connectDB();
            logger.info('Database connected successfully');
            if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
                logger.warn('Redis is already connecting/connected');
            } else {
                await redisClient.connect();
                logger.info('Redis connected successfully');
            }
        } catch (error) {
            logger.error('Error connecting to databases:', error);
            throw new DatabaseError('Failed to connect to the database');
        }
    }
    
}




const {PORT} = process.env  

new App().app.listen(PORT || 3000, () => {
    console.log(`Server running on port ${PORT || 3000}`);
});


export default new App().app;
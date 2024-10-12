import { Router } from 'express';
import { Pool } from 'pg';
import { createAuthRoutes } from './auth.routes';
import { createUserRoutes } from './user.routes';
import { createPostRoutes } from './post.routes';
import { createCommentRoutes } from './comment.routes';
import { createAuthMiddleware } from '../middlewares/auth.middleware';

export function createApiRoutes(pool: Pool) {
  const router = Router();
  const auth = createAuthMiddleware();

  // Health check route
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount route groups
  router.use('/auth', createAuthRoutes(pool));
  router.use('/users', auth.authenticate, createUserRoutes(pool));
  router.use('/posts', auth.authenticate, createPostRoutes(pool));
  router.use('/comments', auth.authenticate, createCommentRoutes(pool));

  return router;
}

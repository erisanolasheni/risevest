import { Router } from 'express';
import { Pool } from 'pg';
import { ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export abstract class BaseRoutes {
  protected router: Router;
  protected pool: Pool;

  constructor(pool: Pool) {
    this.router = Router();
    this.pool = pool;
  }

  protected abstract initializeRoutes(): void;

  protected validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      res.status(400).json({ errors: errors.array() });
    };
  };

  public getRouter(): Router {
    return this.router;
  }
}
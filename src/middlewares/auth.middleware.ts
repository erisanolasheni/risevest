import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import {
  verifyToken,
  extractTokenFromHeader,
  TokenPayload,
} from "../utils/jwt";
import { redisClient } from "../config/redis";
import { UserService } from "../services/user.service";
import { UserModel } from "../models/user.model";
import { ApiError, logger } from "../utils/logger";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  constructor(private readonly userService: UserService) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Extract token from header
      const token = extractTokenFromHeader(req.headers.authorization);

      // Check if token is blacklisted in Redis
      const isBlacklisted = await redisClient.get(`blacklisted_${token}`);
      if (isBlacklisted) {
        return res.status(401).json({ message: "Token has been revoked" });
      }

      // Verify token
      const decoded = verifyToken(token);

      // Check if user still exists in database
      await this.userService.getUserById(decoded.userId);

      // Attach user to request object
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof ApiError || (<Error>error).message.match("token")) {
        return res.status(401).json({ message: (<Error>error).message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Example of middleware factory function
export const createAuthMiddleware = () => {
  return new AuthMiddleware(new UserService(UserModel));
};

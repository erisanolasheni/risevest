import { Request, Response } from "express";
import { DatabaseError, Pool } from "pg";
import { AuthService } from "../services/auth.service";
import { extractTokenFromHeader } from "../utils/jwt";
import { ApiError, logger } from "../utils/logger";

export class AuthController {
  private authService: AuthService;

  constructor(pool: Pool) {
    this.authService = new AuthService(pool);
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password
      );

      logger.warn("mocked logins  " + JSON.stringify({ accessToken, refreshToken } ));

      res.json({
        accessToken,
        refreshToken,
        tokenType: "Bearer",
      });
    } catch (error) {
      res.status(401).json({ message: (<any>error).message });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.authService.register(name, email, password);
      res.status(201).json(user); // Return the ID of the newly created user
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const { accessToken, newRefreshToken } = await this.authService.refresh(
        refreshToken
      );
      res.json({
        accessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      await this.authService.logout(token);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Error during logout" });
    }
  };
}

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  validateLogin,
  validateRegister,
  validateMiddleware,
} from "../middlewares/validation.middleware";
import { Pool } from "pg";
import { BaseRoutes } from "./base.routes";

export class AuthRoutes extends BaseRoutes {
  private authController: AuthController;

  constructor(pool: Pool) {
    super(pool);
    this.authController = new AuthController(this.pool);
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.post(
      "/register",
      this.validate(validateRegister),
      this.authController.register
    );
    this.router.post(
      "/login",
      this.validate(validateLogin),
      this.authController.login
    );
    this.router.post("/logout", this.authController.logout);
  }
}

export function createAuthRoutes(pool: Pool): Router {
  const authRoutes = new AuthRoutes(pool);
  return authRoutes.getRouter();
}

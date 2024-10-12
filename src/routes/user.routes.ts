import { Router } from "express";
import { UserController } from "../controllers/user.controller";

import { Pool } from "pg";
import { BaseRoutes } from "./base.routes";
import { UserService } from "../services/user.service";
import { UserModel } from "../models/user.model";
import { validateUserUpdate } from "../middlewares/validation.middleware";

export class UserRoutes extends BaseRoutes {
  private userController: UserController;

  constructor(pool: Pool) {
    super(pool);
    this.userController = new UserController(new UserService(UserModel));
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.get("/", this.userController.getAllUsers);
    this.router.get(
      "/top-users",
      this.userController.getTopUsersWithLatestComments
    );
    this.router.get("/:id", this.userController.getUserById);
    this.router.get(
      "/:id/posts",

      this.userController.getUserPosts
    );
    this.router.put("/:id", this.validate(validateUserUpdate), this.userController.updateUser);
    this.router.delete("/:id", this.userController.deleteUser);
  }
}

export function createUserRoutes(pool: Pool): Router {
  const userRoutes = new UserRoutes(pool);
  return userRoutes.getRouter();
}

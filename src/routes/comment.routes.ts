import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { validateComment } from "../middlewares/validation.middleware";
import { BaseRoutes } from "./base.routes";
import { CommentService } from "../services/comment.service";
import { CommentModel } from "../models/comment.model";
import { Pool } from "pg";

export class CommentRoutes extends BaseRoutes {
  private commentController: CommentController;

  constructor(pool: Pool) {
    super(pool);
    this.commentController = new CommentController(
      new CommentService(CommentModel)
    );
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.put(
      "/comments/:id",
      this.validate(validateComment),
      this.commentController.updateComment
    );
    this.router.delete("/comments/:id", this.commentController.deleteComment);
  }
}

export function createCommentRoutes(pool: Pool): Router {
  const commentRoutes = new CommentRoutes(pool);
  return commentRoutes.getRouter();
}

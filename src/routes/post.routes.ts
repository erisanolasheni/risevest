import { Router } from "express";
import { PostController } from "../controllers/post.controller";
import {
  validateComment,
  validatePost,
  validatePostUpdate,
} from "../middlewares/validation.middleware";
import { BaseRoutes } from "./base.routes";
import { PostService } from "../services/post.service";
import { PostModel } from "../models/post.model";
import { Pool } from "pg";
import { CommentController } from "../controllers/comment.controller";
import { CommentService } from "../services/comment.service";
import { CommentModel } from "../models/comment.model";

export class PostRoutes extends BaseRoutes {
  private postController: PostController;
  private commentController: CommentController;

  constructor(pool: Pool) {
    super(pool);
    const postService = new PostService(PostModel);
    this.postController = new PostController(postService);

    const commentService = new CommentService(CommentModel);
    this.commentController = new CommentController(commentService);

    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.post(
      "/",
      this.validate(validatePost),
      this.postController.createPost
    );
    this.router.post(
      "/",
      this.validate(validatePost),
      this.postController.createPost
    );
    this.router.get("/", this.postController.getAllPosts);

    // post comments routes
    this.router.post(
      "/:postId/comments",
      this.validate(validateComment),
      this.commentController.createComment
    );

    this.router.get(
      "/:postId/comments",
      this.commentController.getCommentsByPostId
    );
    this.router.get("/:id", this.postController.getPostById);
    this.router.put(
      "/:id",
      this.validate(validatePostUpdate),
      this.postController.updatePost
    );
    this.router.delete("/:id", this.postController.deletePost);
  }
}

export function createPostRoutes(pool: Pool): Router {
  const postRoutes = new PostRoutes(pool);
  return postRoutes.getRouter();
}

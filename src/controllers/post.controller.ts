import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { ApiError, DatabaseError } from "../utils/logger";

export class PostController {
  constructor(private postService: PostService) {}

  createPost = async (req: Request, res: Response) => {
    try {
      const { title, content } = req.body;
      const userId = req.user!.userId;

      const post = await this.postService.createPost({
        title,
        content,
        userId: userId,
      });

      res.status(201).json(post);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };

  getAllPosts = async (req: Request, res: Response) => {
    try {
      const posts = await this.postService.getAllPosts();
      res.json(posts);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };

  getPostById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(id);
      res.json(post);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };

  getPostsByUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const posts = await this.postService.getPostsByUser(userId);
      res.json(posts);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };

  updatePost = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const post = await this.postService.updatePost(id, userId, req.body);

      res.json(post);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };

  deletePost = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      await this.postService.deletePost(id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error deleting post" });
      }
    }
  };
}

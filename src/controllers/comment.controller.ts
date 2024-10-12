import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { ApiError, DatabaseError } from '../utils/logger';

export class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const userId = req.user!.userId;

      const comment = await this.commentService.createComment({
        content,
        userId: userId,
        postId: postId
      });

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  getCommentsByPostId = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const comments = await this.commentService.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  updateComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user!.userId;

      const comment = await this.commentService.updateComment(id, userId, { content });
      res.json(comment);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  deleteComment = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      await this.commentService.deleteComment(id, userId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}
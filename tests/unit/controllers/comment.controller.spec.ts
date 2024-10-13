import { Request, Response } from 'express';
import { CommentController } from '../../../src/controllers/comment.controller';
import { CommentService } from '../../../src/services/comment.service';
import { ApiError, DatabaseError } from '../../../src/utils/logger';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: jest.Mocked<CommentService>;

  beforeEach(() => {
    commentService = {
      createComment: jest.fn(),
      getCommentsByPostId: jest.fn(),
      updateComment: jest.fn(),
      deleteComment: jest.fn(),
    } as unknown as jest.Mocked<CommentService>;

    commentController = new CommentController(commentService);
  });

  describe('createComment', () => {
    it('should create a comment and return 201 status', async () => {
      const req = {
        body: { content: 'Test comment' },
        params: { postId: 'post123' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      commentService.createComment.mockResolvedValue({
        id: 'comment123',
        postId: 'post123',
        userId: 'user123',
        content: 'Test comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await commentController.createComment(req, res);

      expect(commentService.createComment).toHaveBeenCalledWith({
        content: 'Test comment',
        userId: 'user123',
        postId: 'post123',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'comment123',
        content: 'Test comment',
      }));
    });

    it('should handle errors when creating a comment', async () => {
      const req = {
        body: { content: 'Test comment' },
        params: { postId: 'post123' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      commentService.createComment.mockRejectedValue(new DatabaseError("Error creating comment"));

      await commentController.createComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating comment' });
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return a list of comments for a post', async () => {
      const req = {
        params: { postId: 'post123' },
      } as unknown as Request;

      const res = {
        json: jest.fn(),
      } as unknown as Response;

      commentService.getCommentsByPostId.mockResolvedValue([
        { id: 'comment1', postId: 'post123', userId: 'user1', content: 'Comment 1', createdAt: new Date(), updatedAt: new Date() } as any,
        { id: 'comment2', postId: 'post123', userId: 'user2', content: 'Comment 2', createdAt: new Date(), updatedAt: new Date() } as any,
      ]);

      await commentController.getCommentsByPostId(req, res);

      expect(commentService.getCommentsByPostId).toHaveBeenCalledWith('post123');
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ content: 'Comment 1' }),
        expect.objectContaining({ content: 'Comment 2' }),
      ]));
    });

    it('should handle errors when fetching comments', async () => {
      const req = {
        params: { postId: 'post123' },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      commentService.getCommentsByPostId.mockRejectedValue(new DatabaseError("Error fetching comments"));

      await commentController.getCommentsByPostId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching comments' });
    });
  });

  describe('updateComment', () => {
    it('should update a comment and return the updated comment', async () => {
      const req = {
        params: { id: 'comment123' },
        body: { content: 'Updated comment' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        json: jest.fn(),
      } as unknown as Response;

      commentService.updateComment.mockResolvedValue({
        id: 'comment123',
        postId: 'post123',
        userId: 'user123',
        content: 'Updated comment',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await commentController.updateComment(req, res);

      expect(commentService.updateComment).toHaveBeenCalledWith('comment123', 'user123', { content: 'Updated comment' });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'comment123',
        content: 'Updated comment',
      }));
    });

    it('should handle errors when updating a comment', async () => {
      const req = {
        params: { id: 'comment123' },
        body: { content: 'Updated comment' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      commentService.updateComment.mockRejectedValue(new DatabaseError("Error updating comment"));

      await commentController.updateComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating comment' });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment and return 204 status', async () => {
      const req = {
        params: { id: 'comment123' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      commentService.deleteComment.mockResolvedValue();

      await commentController.deleteComment(req, res);

      expect(commentService.deleteComment).toHaveBeenCalledWith('comment123', 'user123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle errors when deleting a comment', async () => {
      const req = {
        params: { id: 'comment123' },
        user: { userId: 'user123', email: 'user@example.com' }
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      commentService.deleteComment.mockRejectedValue(new DatabaseError("Error deleting comment"));

      await commentController.deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting comment' });
    });
  });
});

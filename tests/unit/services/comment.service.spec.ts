import { CommentService } from '../../../src/services/comment.service';
import { CommentModel } from '../../../src/models/comment.model';
import { ApiError, DatabaseError } from '../../../src/utils/logger';

describe('CommentService', () => {
  let commentService: CommentService;
  let mockCommentModel: typeof CommentModel;

  beforeEach(() => {
    mockCommentModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPostId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      checkPostExists: jest.fn(),
    } as unknown as typeof CommentModel;

    commentService = new CommentService(mockCommentModel);
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      (mockCommentModel.checkPostExists as jest.Mock).mockResolvedValue(true);
      (mockCommentModel.create as jest.Mock).mockResolvedValue({
        id: '123',
        postId: 'uu-id',
        userId: 'user123',
        content: 'Test comment',
      });

      const result = await commentService.createComment({
        postId: 'uu-id',
        userId: 'user123',
        content: 'Test comment',
      });

      expect(result).toEqual({
        id: '123',
        postId: 'uu-id',
        userId: 'user123',
        content: 'Test comment',
      });
    });

    it('should throw an ApiError if the post does not exist', async () => {
      (mockCommentModel.checkPostExists as jest.Mock).mockResolvedValue(false);

      await expect(
        commentService.createComment({ postId: 'uu-id', userId: 'user123', content: 'Test comment' })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      (mockCommentModel.update as jest.Mock).mockResolvedValue({
        id: '123',
        postId: 'uu-id',
        userId: 'user123',
        content: 'Updated comment',
      });

      const result = await commentService.updateComment('123', 'user123', { content: 'Updated comment' });

      expect(result).toEqual({
        id: '123',
        postId: 'uu-id',
        userId: 'user123',
        content: 'Updated comment',
      });
    });

    it('should throw an ApiError if the comment is not found', async () => {
      (mockCommentModel.update as jest.Mock).mockResolvedValue(null);

      await expect(
        commentService.updateComment('123', 'user123', { content: 'Updated comment' })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      (mockCommentModel.delete as jest.Mock).mockResolvedValue(true);

      await expect(commentService.deleteComment('123', 'user123')).resolves.toBeUndefined();
    });

    it('should throw an ApiError if the comment is not found', async () => {
      (mockCommentModel.delete as jest.Mock).mockResolvedValue(null);

      await expect(commentService.deleteComment('123', 'user123')).rejects.toThrow(ApiError);
    });
  });
});

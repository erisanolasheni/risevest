import { PostController } from '../../../src/controllers/post.controller';
import { PostService } from '../../../src/services/post.service';
import { Request, Response } from 'express';
import { ApiError, DatabaseError } from '../../../src/utils/logger';

jest.mock('../../../src/services/post.service');

describe('PostController', () => {
  let postController: PostController;
  let mockPostService: jest.Mocked<PostService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockPostService = {
      createPost: jest.fn(),
      getPostsByUser: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
      getTopUsersWithLatestComments: jest.fn(),
    } as any;

    postController = new PostController(mockPostService);

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postData = {
        title: 'Test Post',
        content: 'Test Content'
      };

      mockRequest = {
        body: postData,
        user: { userId: '123' }
      };

      const mockPost = {
        id: 1,
        ...postData,
        createdAt: new Date()
      };

      mockPostService.createPost.mockResolvedValueOnce(mockPost);

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPost);
    });

    it('should handle database errors', async () => {
      mockRequest = {
        body: { title: 'Test', content: 'Content' },
        user: { userId: '123' }
      };

      mockPostService.createPost.mockRejectedValueOnce(new DatabaseError('Database error'));

      await postController.createPost(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });
  });

});
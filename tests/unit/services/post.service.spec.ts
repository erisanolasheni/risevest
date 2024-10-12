import { PostService } from '../../../src/services/post.service';
import { Pool } from 'pg';
import { ApiError, DatabaseError } from '../../../src/utils/logger';

jest.mock('pg');

describe('PostService', () => {
  let postService: PostService;
  let mockPool: jest.Mocked<Pool>;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn(),
    } as any;

    postService = new PostService(mockPool);
  });

  describe('createPost', () => {
    const postData = {
      title: 'Test Post',
      content: 'Test Content',
      userId: '123'
    };

    it('should create a post successfully', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          ...postData,
          createdAt: new Date()
        }]
      }); // INSERT
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await postService.createPost(postData);

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        title: postData.title,
        content: postData.content
      }));
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should rollback and throw error on failure', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
      mockClient.query.mockRejectedValueOnce(new Error('Database error')); // INSERT

      await expect(postService.createPost(postData))
        .rejects.toThrow(DatabaseError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getPostsByUser', () => {
    it('should return user posts with comment count', async () => {
      const mockPosts = [{
        id: 1,
        title: 'Test Post',
        content: 'Content',
        createdAt: new Date(),
        authorName: 'Test User',
        commentCount: '2'
      }];

      mockPool.query.mockResolvedValueOnce({ rows: mockPosts });

      const result = await postService.getPostsByUser('123');

      expect(result).toEqual(mockPosts);
    });

    it('should throw DatabaseError on failure', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(postService.getPostsByUser('123'))
        .rejects.toThrow(DatabaseError);
    });
  });

});
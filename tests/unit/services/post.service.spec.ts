// tests/unit/services/post.service.spec.ts
import { PostService } from "../../../src/services/post.service";
import { PostModel } from "../../../src/models/post.model";
import { ApiError, DatabaseError } from "../../../src/utils/logger";
import { IPostCreate, IPostUpdate } from "../../../src/types/custom";

jest.mock("../../../src/models/post.model");

describe("PostService", () => {
  let postService: PostService;
  const mockPostModel = {
    getAllPosts: jest.fn(),
    create: jest.fn(),
    getPostById: jest.fn(),
    getPostsByUser: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    postService = new PostService(mockPostModel as unknown as typeof PostModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPosts", () => {
    it("should return all posts", async () => {
      const posts = [{ id: "1", title: "Sample Post", content: "Content" }];
      mockPostModel.getAllPosts.mockResolvedValue(posts);

      const result = await postService.getAllPosts();
      expect(result).toEqual(posts);
      expect(mockPostModel.getAllPosts).toHaveBeenCalledTimes(1);
    });
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      const postData: IPostCreate = { title: "New Post", content: "Content", userId: "user123" };
      const createdPost = { id: "1", ...postData };
      mockPostModel.create.mockResolvedValue(createdPost);

      const result = await postService.createPost(postData);
      expect(result).toEqual(createdPost);
      expect(mockPostModel.create).toHaveBeenCalledWith(postData);
    });
  });

  describe("getPostById", () => {
    it("should return a post by ID", async () => {
      const post = { id: "1", title: "Post Title", content: "Content" };
      mockPostModel.getPostById.mockResolvedValue(post);

      const result = await postService.getPostById("1");
      expect(result).toEqual(post);
      expect(mockPostModel.getPostById).toHaveBeenCalledWith("1");
    });

    it("should throw ApiError if post is not found", async () => {
      mockPostModel.getPostById.mockResolvedValue(null);

      await expect(postService.getPostById("1")).rejects.toThrow(ApiError);
    });

    it("should throw DatabaseError on other errors", async () => {
      mockPostModel.getPostById.mockRejectedValue(new Error("DB Error"));

      await expect(postService.getPostById("1")).rejects.toThrow(DatabaseError);
    });
  });

  describe("getPostsByUser", () => {
    it("should return posts by user ID", async () => {
      const posts = [{ id: "1", title: "Post Title", content: "Content" }];
      mockPostModel.getPostsByUser.mockResolvedValue(posts);

      const result = await postService.getPostsByUser("user123");
      expect(result).toEqual(posts);
      expect(mockPostModel.getPostsByUser).toHaveBeenCalledWith("user123");
    });
  });

  describe("updatePost", () => {
    it("should update a post", async () => {
      const postData: IPostUpdate = { title: "Updated Post", content: "Hello, how are you?" };
      const updatedPost = { id: "1", title: "Updated Post", content: "Content" };
      mockPostModel.update.mockResolvedValue(updatedPost);

      const result = await postService.updatePost("1", "user123", postData);
      expect(result).toEqual(updatedPost);
    });

    it("should throw ApiError if post is not found or unauthorized", async () => {
      mockPostModel.update.mockResolvedValue(null);

      const postData: IPostUpdate = { title: "Updated Post", content: "Hello, how are you?" };


      await expect(postService.updatePost("1", "user123", postData)).rejects.toThrow(ApiError);
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      mockPostModel.delete.mockResolvedValue(true);

      await postService.deletePost("1", "user123");
      expect(mockPostModel.delete).toHaveBeenCalledWith("1", "user123");
    });

    it("should throw DatabaseError on failure", async () => {
      mockPostModel.delete.mockRejectedValue(new Error("DB Error"));

      await expect(postService.deletePost("1", "user123")).rejects.toThrow(DatabaseError);
    });
  });
});

// tests/unit/controllers/post.controller.spec.ts
import { Request, Response } from "express";
import { PostController } from "../../../src/controllers/post.controller";
import { PostService } from "../../../src/services/post.service";
import { ApiError, DatabaseError } from "../../../src/utils/logger";

jest.mock("../../../src/services/post.service");

describe("PostController", () => {
  let postController: PostController;
  let mockPostService: PostService;

  const mockRequest = {} as Request;
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  beforeEach(() => {
    mockPostService = new PostService({} as any);
    postController = new PostController(mockPostService);

    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      mockRequest.body = { title: "Post Title", content: "Post Content" };
      (<any>mockRequest).user = { userId: "user123" };
      const post = { id: "1", ...mockRequest.body, userId: "user123" };
      jest.spyOn(mockPostService, "createPost").mockResolvedValue(post);

      await postController.createPost(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(post);
    });

    it("should handle database errors gracefully", async () => {
      mockRequest.body = { title: "Post Title", content: "Post Content" };
      (<any>mockRequest).user = { userId: "user123" };
      jest.spyOn(mockPostService, "createPost").mockRejectedValue(new DatabaseError("DB Error"));

      await postController.createPost(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "DB Error" });
    });
  });

  describe("getAllPosts", () => {
    it("should return all posts", async () => {
      const posts = [{ id: "1", title: "Sample Post" }];
      jest.spyOn(mockPostService, "getAllPosts").mockResolvedValue(posts);

      await postController.getAllPosts(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith(posts);
    });
  });

  describe("getPostById", () => {
    it("should return a post by ID", async () => {
      const post = { id: "1", title: "Sample Post" };
      mockRequest.params = { id: "1" };
      jest.spyOn(mockPostService, "getPostById").mockResolvedValue(post as any);

      await postController.getPostById(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith(post);
    });

    it("should handle not found error", async () => {
      mockRequest.params = { id: "1" };
      jest.spyOn(mockPostService, "getPostById").mockRejectedValue(new ApiError("Post not found", 404));

      await postController.getPostById(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Post not found" });
    });
  });

  describe("updatePost", () => {
    it("should update a post", async () => {
      mockRequest.params = { id: "1" };
      (<any>mockRequest).user = { userId: "user123" };
      mockRequest.body = { title: "Updated Post" };
      const updatedPost = { id: "1", ...mockRequest.body };
      jest.spyOn(mockPostService, "updatePost").mockResolvedValue(updatedPost);

      await postController.updatePost(mockRequest, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedPost);
    });

    it("should handle authorization errors", async () => {
      mockRequest.params = { id: "1" };
      (<any>mockRequest).user = { userId: "user123" };
      jest.spyOn(mockPostService, "updatePost").mockRejectedValue(new ApiError("Unauthorized", 403));

      await postController.updatePost(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
  });

  describe("deletePost", () => {
    it("should delete a post", async () => {
      mockRequest.params = { id: "1" };
      (<any>mockRequest).user = { userId: "user123" };
      jest.spyOn(mockPostService, "deletePost").mockResolvedValue();

      await postController.deletePost(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it("should handle deletion errors", async () => {
      mockRequest.params = { id: "1" };
      (<any>mockRequest).user = { userId: "user123" };
      jest.spyOn(mockPostService, "deletePost").mockRejectedValue(new DatabaseError("Error deleting post"));

      await postController.deletePost(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "Error deleting post" });
    });
  });
});

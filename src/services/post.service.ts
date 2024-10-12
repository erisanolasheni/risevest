// services/post.service.ts
import {
  IPost,
  IPostCreate,
  IPostUpdate,
  IPostResponse,
} from "../types/custom";
import { DatabaseError, ApiError, logger } from "../utils/logger";
import { PostModel } from "../models/post.model";

export class PostService {
  constructor(private postModel: typeof PostModel) {}

  async getAllPosts() {
    return this.postModel.getAllPosts();
  }

  async createPost(postData: IPostCreate): Promise<IPost> {
    return this.postModel.create(postData);
  }

  async getPostById(id: string): Promise<IPostResponse> {
    try {
      const post = await this.postModel.getPostById(id);
      if (!post) {
        throw new ApiError("Post not found", 404);
      }
      return post as unknown as IPostResponse;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        logger.error(error);
        throw new DatabaseError("Error fetching post");
      }
      throw error;
    }
  }

  async getPostsByUser(userId: string): Promise<IPostResponse[]> {
    try {
      return await this.postModel.getPostsByUser(userId);
    } catch (error) {
      throw new DatabaseError("Error fetching posts");
    }
  }

  async updatePost(
    id: string,
    userId: string,
    postData: IPostUpdate
  ): Promise<IPost> {
    try {
      const result = await this.postModel.update(id, userId, postData);
      if (!result) {
        throw new ApiError("Post not found or unauthorized", 404);
      }
      return result;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        logger.error(error);
        throw new DatabaseError("Error updating post");
      }
      throw error;
    }
  }

  async deletePost(id: string, userId: string): Promise<void> {
    try {
      await this.postModel.delete(id, userId);
    } catch (error) {
      throw new DatabaseError("Error deleting post");
    }
  }
}

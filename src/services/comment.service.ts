import { CommentModel } from "../models/comment.model";
import {
  ICommentCreate,
  ICommentUpdate,
  ICommentResponse,
} from "../types/custom";
import { ApiError, DatabaseError } from "../utils/logger";

export class CommentService {
  constructor(private commentModel: typeof CommentModel) {}

  async createComment(commentData: ICommentCreate): Promise<ICommentResponse> {
    try {
      const postExists = await this.commentModel.checkPostExists(
        commentData.postId
      );

      if (!postExists) {
        throw new ApiError("Post not found", 404);
      }

      return await this.commentModel.create(
        commentData.postId,
        commentData.userId,
        commentData.content
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error creating comment");
    }
  }

  async getCommentsByPostId(postId: string): Promise<ICommentResponse[]> {
    try {
      return await this.commentModel.findByPostId(postId);
    } catch (error) {
      throw new DatabaseError("Error fetching comments");
    }
  }

  async updateComment(
    id: string,
    userId: string,
    commentData: ICommentUpdate
  ): Promise<ICommentResponse> {
    try {
      const comment = await this.commentModel.update(id, commentData.content);
      if (!comment) {
        throw new ApiError("Comment not found or unauthorized", 404);
      }
      return comment;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error updating comment");
    }
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    try {
      const success = await this.commentModel.delete(id);
      if (!success) {
        throw new ApiError("Comment not found or unauthorized", 404);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error deleting comment");
    }
  }
}

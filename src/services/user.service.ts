import argon2 from "argon2";
import { IUserCreate, IUserUpdate, IUserResponse } from "../types/custom";
import { DatabaseError, ApiError, logger } from "../utils/logger";
import { UserModel } from "../models/user.model";

export class UserService {
  constructor(private userModel: typeof UserModel) {}

  async createUser(userData: IUserCreate): Promise<IUserResponse> {
    try {
      const existingUser = await this.userModel.findUserByEmail(userData.email);

      if (existingUser) {
        throw new ApiError("Name or email already exists", 400);
      }

      const hashedPassword = await argon2.hash(userData.password);

      const result = await this.userModel.create({
        ...userData,
        passwordHash: hashedPassword,
      });

      return result as unknown as IUserResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error creating user");
    }
  }

  async getUserById(id: string): Promise<IUserResponse> {
    try {
      const user = await this.userModel.getUserById(id);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      return user as unknown as IUserResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error fetching user");
    }
  }

  async findUserByEmail(email: string): Promise<IUserResponse> {
    try {
      const user = await this.userModel.findUserByEmail(email);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      return user as unknown as IUserResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error fetching user");
    }
  }

  async updateUser(id: string, userData: IUserUpdate): Promise<IUserResponse> {
    try {
      if (userData.password) {
        userData.password = await argon2.hash(userData.password);
      }

      const updatedUser = await this.userModel.update(id, userData);

      if (!updatedUser) {
        throw new ApiError("User not found", 404);
      }

      return updatedUser as unknown as IUserResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error updating user");
    }
  }

  async getAllUsers(): Promise<IUserResponse[]> {
    try {
      return (await this.userModel.getAllUsers()) as unknown[] as IUserResponse[];
    } catch (error) {
      throw new DatabaseError("Error fetching users");
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteUser(id);
      if (!result) {
        throw new ApiError("User not found", 404);
      }
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new DatabaseError("Error deleting user");
    }
  }

  async getUserPosts(id: string): Promise<any[]> {
    // Change `any` to your post type
    try {
      return await this.userModel.getUserPosts(id);
    } catch (error) {
      throw new DatabaseError("Error fetching user posts");
    }
  }

  async getTopUsersWithLatestComments(): Promise<any[]> {
    try {
      return await this.userModel.getTopUsersWithLatestComments();
    } catch (error) {
      throw new DatabaseError("Error fetching top users");
    }
  }
}

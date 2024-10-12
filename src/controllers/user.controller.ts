import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiError, DatabaseError, logger } from "../utils/logger";

export class UserController {
  constructor(private userService: UserService) {}

  createUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(req.params.id);

      res.json(user).status(200);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      if (req.params.id != req.user?.userId) {
        throw new ApiError("Not authorized to edit this user.", 403);
      }
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  getUserPosts = async (req: Request, res: Response) => {
    try {
      const posts = await this.userService.getUserPosts(req.params.id);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getTopUsersWithLatestComments = async (req: Request, res: Response) => {
    try {
      const topUsers = await this.userService.getTopUsersWithLatestComments();
      res.json(topUsers);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}

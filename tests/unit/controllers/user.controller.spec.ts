import { UserController } from "../../../src/controllers/user.controller";
import { UserModel } from "../../../src/models/user.model";
import { UserService } from "../../../src/services/user.service";
import { ApiError, DatabaseError } from "../../../src/utils/logger";


jest.mock("../../../src/models/user.model");


describe("UserController", () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: any;
  let mockRes: any;

  const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;


  beforeEach(() => {
    mockUserService = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      getAllUsers: jest.fn(),
      deleteUser: jest.fn(),
      getUserPosts: jest.fn(),
      getTopUsersWithLatestComments: jest.fn(),
    } as any;

    userController = new UserController(mockUserService);

    jest.clearAllMocks();

    mockReq = {
      params: {},
      body: {},
      user: {
        userId: "1",
        email: "john@example.com",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  describe("createUser", () => {
    it("should create a user and return 201", async () => {
      const userData = { email: "test@example.com", password: "password" };
      (mockUserService.createUser as jest.Mock).mockResolvedValue(userData);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(userData);
    });

    it("should return 400 if ApiError is thrown", async () => {
      const apiError = new ApiError("User already exists", 400);
      (mockUserService.createUser as jest.Mock).mockRejectedValue(apiError);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: apiError.message });
    });

    it("should return 500 if DatabaseError is thrown", async () => {
      const dbError = new DatabaseError("Database connection failed");
      (mockUserService.createUser as jest.Mock).mockRejectedValue(dbError);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: dbError.message });
    });

    it("should return 500 for unexpected errors", async () => {
      (mockUserService.createUser as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("getUserById", () => {
    it("should return a user", async () => {
      const userData = { userId: "1", email: "test@example.com" };
      mockReq.params.id = "1";

      (mockUserService.getUserById as jest.Mock).mockResolvedValue(userData);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining(userData));
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.params.id = "1";
      (mockUserService.getUserById as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("updateUser", () => {
    it("should update the user and return the user", async () => {
      const updatedUserData = { userId: "1", email: "updated@example.com" };
      mockReq.params.id = "1";
      mockReq.body = { email: "updated@example.com" };
      (mockUserService.updateUser as jest.Mock).mockResolvedValue(updatedUserData);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(updatedUserData);
    });

    it("should return 403 if the user is not authorized to edit", async () => {
      mockReq.params.id = "1";
      mockReq.body = { email: "updated@example.com" };
      (mockUserService.updateUser as jest.Mock).mockRejectedValue(new ApiError("Not authorized to edit this user.", 403));

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Not authorized to edit this user." });
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.params.id = "1";
      mockReq.body = { email: "updated@example.com" };
      (mockUserService.updateUser as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const usersData = [{ userId: "1", email: "test@example.com" }];
      (mockUserService.getAllUsers as jest.Mock).mockResolvedValue(usersData);

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(usersData);
    });

    it("should return 500 for unexpected errors", async () => {
      (mockUserService.getAllUsers as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return 204", async () => {
      mockReq.params.id = "1";
      (mockUserService.deleteUser as jest.Mock).mockResolvedValue(null);

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.params.id = "1";
      (mockUserService.deleteUser as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("getUserPosts", () => {
    it("should return user posts", async () => {
      const postsData = [{ postId: "1", content: "This is a post." }];
      mockReq.params.id = "1";
      (mockUserService.getUserPosts as jest.Mock).mockResolvedValue(postsData);

      await userController.getUserPosts(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(postsData);
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.params.id = "1";
      (mockUserService.getUserPosts as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.getUserPosts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });

  describe("getTopUsersWithLatestComments", () => {
    it("should return top users with latest comments", async () => {
      const topUsersData = [{ userId: "1", email: "topuser@example.com" }];
      (mockUserService.getTopUsersWithLatestComments as jest.Mock).mockResolvedValue(topUsersData);

      await userController.getTopUsersWithLatestComments(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(topUsersData);
    });

    it("should return 500 for unexpected errors", async () => {
      (mockUserService.getTopUsersWithLatestComments as jest.Mock).mockRejectedValue(new Error("Unexpected error"));

      await userController.getTopUsersWithLatestComments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });
});

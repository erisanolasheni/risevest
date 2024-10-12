import { AuthController } from "../../../src/controllers/auth.controller";
import argon2 from "argon2";
import { generateToken } from "../../../src/utils/jwt";
import { UserModel } from "../../../src/models/user.model";
import { pool } from "../../../src/config/database";
import { Request, Response } from "express";

// Mock UserModel properly
jest.mock("../../../src/models/user.model");

describe("AuthController", () => {
  let authController: AuthController;

  const mockUser = {
    id: "userId123",
    email: "olasheni@example.com",
    passwordHash: "hashedPassword",
  };

  beforeEach(() => {
    // Initialize the mock UserService
    authController = new AuthController(pool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    const newUser = {
      id: "newUserId",
      email: "jane@example.com",
      passwordHash: "hashedPassword", 
    };

  
    (UserModel.create as jest.Mock).mockResolvedValue(newUser);
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null); 

    const req = {
      body: {
        name: "Erisan Olasheni",
        email: "jane@example.com",
        password: "password123",
      },
    } as Partial<Request>;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    await authController.register(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(newUser);
  });

  it("should return error with status 400 if user already exists", async () => {
    // Simulate that a user already exists with that email
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

    const req = {
      body: {
        name: "Erisan Olasheni",
        email: "olasheni@example.com",
        password: "password123",
      },
    } as Partial<Request>;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    await authController.register(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name or email already exists",
    });
  });

  it("should return access token on successful login", async () => {
    // Mock UserModel.findUserByEmail to return the mock user
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

    jest.spyOn(argon2, "verify").mockResolvedValue(true); // Simulate password verification

    const req = {
      body: {
        email: "olasheni@example.com",
        password: "password123",
      },
    } as Partial<Request>;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    // Generate the access token using generateToken
    const accessToken = generateToken({
      userId: mockUser.id,
      email: mockUser.email,
    });

    await authController.login(req as Request, res as Response);

    // Check if the response object has the accessToken property
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken })
    );
  });

  it("should return error with status 401 if user not found", async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null);

    const req = {
      body: {
        email: "wrong@example.com",
        password: "password123",
      },
    } as Partial<Request>;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    await authController.login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("should return error with status 401 if password is invalid", async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    jest.spyOn(argon2, "verify").mockResolvedValue(false); // Simulate invalid password

    const req = {
      body: {
        email: "olasheni@example.com",
        password: "wrongPassword",
      },
    } as Partial<Request>;

    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    await authController.login(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });
});

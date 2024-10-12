import { UserService } from "../../../src/services/user.service";
import { Pool } from "pg";
import { ApiError, DatabaseError } from "../../../src/utils/logger";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("pg");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("UserService", () => {
  let userService: UserService;
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

    userService = new UserService(mockPool);
  });

  describe("createUser", () => {
    const userData = {
      name: "testuser",
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    it("should create a user successfully", async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) 
        .mockResolvedValueOnce({ rows: [{ ...userData, id: 1 }] }); // Insert user

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await userService.createUser(userData);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: userData.name,
          email: userData.email,
        })
      );
    });
  });
});

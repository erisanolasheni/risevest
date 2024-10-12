import { AuthService } from "../../../src/services/auth.service";
import { Pool } from "pg";
import argon2 from "argon2";
import { UserModel } from "../../../src/models/user.model";
import { redisClient } from "../../../src/config/redis";
import { ApiError } from "../../../src/utils/logger";

jest.mock("../../../src/models/user.model"); // Mock UserModel directly
jest.mock("../../../src/config/redis"); // Mock Redis client

describe("AuthService", () => {
  let authService: AuthService;
  const mockPool = {} as Pool; // Mock the Pool instance as needed

  beforeEach(() => {
    authService = new AuthService(mockPool);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should login successfully", async () => {
    const email = "test@example.com";
    const password = "password";
    const user = {
      id: "user-id",
      email,
      passwordHash: await argon2.hash(password),
    };

    // Mock UserModel method
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(user);

    const tokens = await authService.login(email, password);

    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(email);
    expect(await argon2.verify(user.passwordHash, password)).toBe(true);
    expect(tokens).toHaveProperty("accessToken");
  });

  it("should throw an error on invalid credentials during login", async () => {
    const email = "test@example.com";
    const password = "wrongpassword";
    const user = {
      id: "user-id",
      email,
      passwordHash: await argon2.hash("password"), // Correct password
    };

    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(user);

    await expect(authService.login(email, password)).rejects.toThrow(
      "Invalid credentials"
    );
  });

  it("should register a new user successfully", async () => {
    const name = "Test User";
    const email = "test@example.com";
    const password = "password";
    const userData = {
      id: "user-id",
      name,
      email,
      passwordHash: await argon2.hash(password),
    };

    // Ensure no user exists with the given email
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null);

    // Mock the UserModel.create method
    (UserModel.create as jest.Mock).mockResolvedValue(userData);

    const result = await authService.register(name, email, password);

    // Assertions
    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(email); // Ensure it checks for existing users
    expect(UserModel.create).toHaveBeenCalledWith({
      name,
      email,
      password: expect.any(String), // Check that the password is hashed
    });
    expect(result).toEqual(userData);
  });

  it("should throw an error on registration failure", async () => {
    const name = "Test User";
    const email = "test@example.com";
    const password = "password";

    (UserModel.create as jest.Mock).mockRejectedValue(
      new ApiError("Name or email already exists", 409)
    );

    await expect(authService.register(name, email, password)).rejects.toThrow(
      "Name or email already exists"
    );
  });

  it("should blacklist the token on logout", async () => {
    const token = "valid.jwt.token";
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1-hour expiry
    const payload = { exp: expirationTime };

    // Mock the payload decoding
    const tokenParts = [
      "header",
      Buffer.from(JSON.stringify(payload)).toString("base64"),
      "signature",
    ];
    const mockToken = tokenParts.join(".");

    // Mock Redis setex
    (redisClient.setex as jest.Mock).mockResolvedValue(undefined);

    await authService.logout(mockToken);

    // Calculate TTL in the test as well
    const now = Math.floor(Date.now() / 1000);
    const expectedTtl = expirationTime - now;

    // Check if setex was called with the correct parameters
    expect(redisClient.setex).toHaveBeenCalledWith(
      `blacklisted_${mockToken}`,
      expectedTtl, // Expected TTL should match
      "1"
    );
  });
});

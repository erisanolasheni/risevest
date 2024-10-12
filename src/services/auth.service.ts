import { Pool } from "pg";
import argon2 from "argon2";
import { redisClient } from "../config/redis";
import { extractTokenFromHeader, generateToken } from "../utils/jwt";
import { RefreshTokenService } from "../utils/refresh-token";
import { ApiError, logger } from "../utils/logger";
import { UserService } from "./user.service";
import { UserModel } from "../models/user.model";

export class AuthService {
  private refreshTokenService: RefreshTokenService;
  private userService: UserService;

  constructor(private pool: Pool) {
    this.refreshTokenService = new RefreshTokenService(pool);
    this.userService = new UserService(UserModel);
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userService.findUserByEmail(email);




      if (!user) {
        throw new ApiError("Invalid credentials", 401);
      }
      console.log("user password" , password)

      const isValidPassword = await argon2.verify(user.passwordHash, password);

      if (!isValidPassword) {
        throw new ApiError("Invalid credentials", 401);
      }



      const accessToken = generateToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        user.id
      );

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error("Invalid credentials");
      } else {
        throw new Error(<any>error);
      }
    }
  }

  async register(name: string, email: string, password: string) {
    try {

      // Insert the new user into the database
      const result = await this.userService.createUser({
        name,
        email,
        password
      });

      return result;
    } catch (error) {
      throw <any>error;
    }
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const userId = await this.refreshTokenService.verifyRefreshToken(
      refreshToken
    );

    if (!userId) {
      throw new Error("Invalid refresh token");
    }

    const result = await this.userService.getUserById(userId);

    const user = result;
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
    });

    const newRefreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id
    );
    await this.refreshTokenService.revokeRefreshToken(refreshToken);

    return { accessToken, newRefreshToken };
  }

  async logout(token: string) {
    const tokenParts = token.split(".");
    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
    const expirationTime = payload.exp;

    const now = Math.floor(Date.now() / 1000);
    const ttl = expirationTime - now;

    if (ttl > 0) {
      await redisClient.setex(`blacklisted_${token}`, ttl, "1");
    }
  }
}

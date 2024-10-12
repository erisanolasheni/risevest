import { randomBytes } from 'crypto';
import { Pool } from 'pg';
import { redisClient } from '../config/redis';
import { generateToken, TokenPayload } from './jwt';

const REFRESH_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 30; // 30 days in seconds

export class RefreshTokenService {
  constructor(private pool: Pool) {}

  generateRefreshToken = async (userId: string): Promise<string> => {
    const refreshToken = randomBytes(40).toString('hex');
    
    // Store refresh token in Redis with user association
    await redisClient.setex(
      `refresh_${refreshToken}`,
      REFRESH_TOKEN_EXPIRES_IN,
      userId
    );
    
    return refreshToken;
  };

  verifyRefreshToken = async (refreshToken: string): Promise<string | null> => {
    const userId = await redisClient.get(`refresh_${refreshToken}`);
    return userId;
  };

  revokeRefreshToken = async (refreshToken: string): Promise<void> => {
    await redisClient.del(`refresh_${refreshToken}`);
  };
}

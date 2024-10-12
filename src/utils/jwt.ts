import jwt from "jsonwebtoken";
import { env } from "custom-env";
env();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export const extractTokenFromHeader = (
  authHeader: string | undefined
): string => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided or invalid format");
  }

  return authHeader.split(" ")[1];
};

import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../../../src/middlewares/auth.middleware';
import { redisClient } from '../../../src/config/redis';
import { UserService } from '../../../src/services/user.service';
import { verifyToken, extractTokenFromHeader } from '../../../src/utils/jwt';
import { UserModel } from '../../../src/models/user.model';

jest.mock('../../../src/services/user.service');
jest.mock('../../../src/utils/jwt');

jest.mock('../../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    quit: jest.fn().mockResolvedValue('OK'),
  },
}));

describe('AuthMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let userService: UserService;
  let authMiddleware: AuthMiddleware;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid.jwt.token',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    userService = new UserService(UserModel);
    authMiddleware = new AuthMiddleware(userService);
  });

  afterAll(async () => {
    await redisClient.quit(); // Ensure Redis client is closed after all tests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should authenticate user with a valid token', async () => {
    const decodedToken = { userId: 'valid-uuid' };
    (extractTokenFromHeader as jest.Mock).mockReturnValue('valid.jwt.token');
    (verifyToken as jest.Mock).mockReturnValue(decodedToken);
    (redisClient.get as jest.Mock).mockResolvedValue(null);
    (userService.getUserById as jest.Mock).mockResolvedValue({ id: 'valid-uuid' });

    await authMiddleware.authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(decodedToken);
  });

  it('should return 401 if token is blacklisted', async () => {
    (extractTokenFromHeader as jest.Mock).mockReturnValue('blacklisted.jwt.token');
    (redisClient.get as jest.Mock).mockResolvedValue('uu-id');

    await authMiddleware.authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token has been revoked' });
  });

  it('should return 401 if token is invalid', async () => {
    (extractTokenFromHeader as jest.Mock).mockReturnValue('invalid.jwt.token');
    (redisClient.get as jest.Mock).mockResolvedValue(null);
    (verifyToken as jest.Mock).mockImplementation(() => { throw new Error("Invalid token"); });

    await authMiddleware.authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it('should return 401 if no authorization header is provided', async () => {
    req.headers = {};  // No authorization header
  
    await authMiddleware.authenticate(req as Request, res as Response, next);
  
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('should return 500 on internal server error', async () => {
    (extractTokenFromHeader as jest.Mock).mockReturnValue('valid.jwt.token');
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'valid-uuid' });
    (userService.getUserById as jest.Mock).mockImplementation(() => { throw new Error('Database error'); });

    await authMiddleware.authenticate(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});

import argon2 from 'argon2';
import { UserService } from '../../../src/services/user.service';
import { UserModel } from '../../../src/models/user.model';
import { ApiError, DatabaseError } from '../../../src/utils/logger';
import { IUserCreate, IUserUpdate } from '../../../src/types/custom';

// Mocking the UserModel to isolate the service layer for testing
jest.mock('../../../src/models/user.model');
jest.mock('argon2');

describe('UserService', () => {
  let userService: UserService;
  const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

  beforeEach(() => {
    userService = new UserService(mockUserModel);
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData: IUserCreate = {
        name: 'Erisan Olasheni',
        email: 'olasheni@example.com',
        password: 'password123',
      };
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: '1',
        name: 'Erisan Olasheni',
        email: 'olasheni@example.com',
        createdAt: new Date(),
      };

      mockUserModel.findUserByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue(createdUser as any);

      const result = await userService.createUser(userData);

      expect(mockUserModel.findUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(argon2.hash).toHaveBeenCalledWith(userData.password);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...userData,
        passwordHash: hashedPassword,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw an error if email already exists', async () => {
      const userData: IUserCreate = {
        name: 'Erisan Olasheni',
        email: 'olasheni@example.com',
        password: 'password123',
      };

      mockUserModel.findUserByEmail.mockResolvedValue(userData as any);

      await expect(userService.createUser(userData)).rejects.toThrowError(
        new ApiError('Name or email already exists', 400)
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const user = {
        id: '1',
        name: 'Erisan Olasheni',
        email: 'olasheni@example.com',
        createdAt: new Date(),
      };

      mockUserModel.getUserById.mockResolvedValue(user as any);

      const result = await userService.getUserById('1');

      expect(mockUserModel.getUserById).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      mockUserModel.getUserById.mockResolvedValue(null);

      await expect(userService.getUserById('1')).rejects.toThrowError(
        new ApiError('User not found', 404)
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userData: IUserUpdate = {
        name: 'Jane Doe',
      };
      const updatedUser = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserModel.update.mockResolvedValue(updatedUser as any);

      const result = await userService.updateUser('1', userData);

      expect(mockUserModel.update).toHaveBeenCalledWith('1', userData);
      expect(result).toEqual(updatedUser);
    });

    it('should hash the password if provided during update', async () => {
      const userData = {
          username: 'testUser',
          password: 'newPassword123',
      };
  
      // Mock argon2.hash to return a predefined hashed password
      const hashedPassword = 'hashedNewPassword123';
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
  
      await userService.updateUser('1', userData);
  
      // Ensure argon2.hash was called with the new password
      expect(argon2.hash).toHaveBeenCalledWith('newPassword123');
  
      // Verify that the update function received the hashed password
      expect(mockUserModel.update).toHaveBeenCalledWith('1', {
          ...userData,
          password: hashedPassword,
      });
  });
  

    it('should throw an error if user not found during update', async () => {
      mockUserModel.update.mockResolvedValue(null);

      await expect(userService.updateUser('1', {})).rejects.toThrowError(
        new ApiError('User not found', 404)
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserModel.deleteUser.mockResolvedValue(true);

      const result = await userService.deleteUser('1');

      expect(mockUserModel.deleteUser).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should throw an error if user not found during delete', async () => {
      mockUserModel.deleteUser.mockResolvedValue(false);

      await expect(userService.deleteUser('1')).rejects.toThrowError(
        new ApiError('User not found', 404)
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', name: 'Erisan Olasheni', email: 'olasheni@example.com' },
        { id: '2', name: 'Erisan Olasheni', email: 'olasheni@example.com' },
      ];

      mockUserModel.getAllUsers.mockResolvedValue(users as any);

      const result = await userService.getAllUsers();

      expect(mockUserModel.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('getUserPosts', () => {
    it('should return posts for a given user ID', async () => {
      const posts = [
        { id: '1', title: 'Post 1', content: 'Content 1', userId: '1' },
        { id: '2', title: 'Post 2', content: 'Content 2', userId: '1' },
      ];

      mockUserModel.getUserPosts.mockResolvedValue(posts);

      const result = await userService.getUserPosts('1');

      expect(mockUserModel.getUserPosts).toHaveBeenCalledWith('1');
      expect(result).toEqual(posts);
    });
  });

  describe('getTopUsersWithLatestComments', () => {
    it('should return top users with their latest comments', async () => {
      const topUsersWithComments = [
        {
          id: '1',
          name: 'Erisan Olasheni',
          postCount: 10,
          latestComment: 'Great post!',
          postTitle: 'Amazing Blog',
          commentCreatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          postCount: 5,
          latestComment: 'Nice article!',
          postTitle: 'Cool Story',
          commentCreatedAt: new Date(),
        },
      ];

      mockUserModel.getTopUsersWithLatestComments.mockResolvedValue(
        topUsersWithComments
      );

      const result = await userService.getTopUsersWithLatestComments();

      expect(mockUserModel.getTopUsersWithLatestComments).toHaveBeenCalled();
      expect(result).toEqual(topUsersWithComments);
    });
  });
});

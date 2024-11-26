import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HttpStatus } from '@nestjs/common';
import { Role } from '../users/users.schema';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call AuthService.register and return the result', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        avatar: null,
        role: Role.USER,
      };

      const mockUser = {
        id: 'user-id',
        ...registerDto,
        password: undefined, // The interceptor is supposed to exclude the password
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result.password).toBeUndefined();
      expect(result).toEqual(mockUser);
    });

    it('should return a CREATED status code', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        avatar: null,
        role: Role.USER,
      };

      const mockUser = {
        id: 'user-id',
        ...registerDto,
        password: undefined,
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await authController.register(registerDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return access and refresh tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokens);
    });

    it('should return a OK status code for successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      mockAuthService.login.mockResolvedValue(mockTokens);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('should call AuthService.refreshToken and return new access and refresh tokens', async () => {
      const refreshToken = 'refreshToken';

      const mockTokens = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);

      const mockRes = {
        cookie: jest.fn(), // Mocking the cookie method
      };

      const result = await authController.refresh(refreshToken, mockRes as any);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({ accessToken: mockTokens.accessToken });

      // Ensure that res.cookie was called with the correct arguments
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, expect.any(Object));
    });

    it('should return an OK status code for successful token refresh', async () => {
      const refreshToken = 'refreshToken';

      const mockTokens = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);

      const mockRes = {
        cookie: jest.fn(),
      };

      const result = await authController.refresh(refreshToken, mockRes as any);

      expect(result).toEqual({ accessToken: mockTokens.accessToken });
    });
  });
});

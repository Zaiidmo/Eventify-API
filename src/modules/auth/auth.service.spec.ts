import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from './bcrypt.service';
import { AuthRepository } from './auth.repository';
import { EmailService } from '@/services/email/email.service';
import { UserRepository } from '../users/users.repository';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role, User } from '../users/users.schema';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: AuthRepository;
  let bcryptService: BcryptService;
  let emailService: EmailService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hashPassword: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendRegistrationEmail: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    bcryptService = module.get<BcryptService>(BcryptService);
    emailService = module.get<EmailService>(EmailService);
    userRepository = module.get<UserRepository>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        username: 'testUser',
        email: 'test@example.com',
        password: 'password',
        avatar: 'avatar.png',
        role: Role.USER,
      };

      const hashedPassword = 'hashedPassword';
      const newUser: User = {
        username: 'testUser',
        email: 'test@example.com',
        password: hashedPassword,
        avatar: 'avatar.png',
        role: Role.USER,
      };

      // Mock repository and service methods
      authRepository.findByEmail = jest.fn().mockResolvedValue(null);
      bcryptService.hashPassword = jest.fn().mockResolvedValue(hashedPassword);
      authRepository.create = jest.fn().mockResolvedValue(newUser);
      emailService.sendRegistrationEmail = jest.fn().mockResolvedValue(true);

      const result = await authService.register(registerDto);
      expect(result).toEqual(newUser);
      expect(authRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testUser',
          email: 'test@example.com',
          password: hashedPassword,
        }),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        username: 'testUser',
        email: 'test@example.com',
        password: 'password',
        avatar: 'avatar.png',
        role: Role.USER,
      };

      const existingUser = { email: 'test@example.com' };
      authRepository.findByEmail = jest.fn().mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return access and refresh tokens', async () => {
      const loginDto: LoginDto = {
        email: 'user@example.com',
        password: 'password',
      };
      const user = { _id: 'user_id', email: 'user@example.com' };

      // Mock the authRepository to return a user
      authRepository.findByEmail = jest.fn().mockResolvedValue(user);

      // Mock the bcryptService to return a valid password comparison
      bcryptService.compare = jest.fn().mockResolvedValue(true);

      // Mock jwtService to return tokens in the correct order
      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        user: user,
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };

      authRepository.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user = { email: 'test@example.com', password: 'hashedPassword' };

      authRepository.findByEmail = jest.fn().mockResolvedValue(user);
      bcryptService.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens', async () => {
      const refreshToken = 'validRefreshToken';
      const user = { _id: 'user_id', email: 'user@example.com' };

      // Mock the jwtService to verify the refresh token
      jwtService.verify = jest.fn().mockReturnValue({ _id: user._id });

      // Mock the userRepository to return a user
      userRepository.findById = jest.fn().mockResolvedValue(user);

      // Mock jwtService to return new tokens
      jwtService.sign = jest
        .fn()
        .mockReturnValueOnce('newAccessToken') // For new access token
        .mockReturnValueOnce('newRefreshToken'); // For new refresh token

      const result = await authService.refreshToken(refreshToken);

      // Ensure the test expectation matches the correct response
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalidRefreshToken';

      jwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

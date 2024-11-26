import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/services/email/email.service';
import { ConflictException } from '@nestjs/common';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { Role,  UserDocument } from '@/modules/users/users.schema';
import { BcryptService } from './bcrypt.service';

describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let emailService: jest.Mocked<EmailService>;
  let bcryptService: jest.Mocked<BcryptService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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
          provide: BcryptService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    emailService = module.get(EmailService);
    bcryptService = module.get(BcryptService);
  });

  it('should register a user successfully', async () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'test-avatar.png',
      role: Role.USER,
    };

    const hashedPassword = 'hashedPassword123';
    const createdUser: UserDocument = {
      _id: 'userId123',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      avatar: 'test-avatar.png',
      role: 'user',
    } as UserDocument;

    authRepository.findByEmail.mockResolvedValue(null);
    bcryptService.hashPassword.mockResolvedValue(hashedPassword);
    authRepository.create.mockResolvedValue(createdUser);

    const result = await authService.register(registerDto);

    expect(authRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(bcryptService.hashPassword).toHaveBeenCalledWith(registerDto.password);
    expect(authRepository.create).toHaveBeenCalledWith({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      avatar: registerDto.avatar,
      role: registerDto.role,
    });
    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(createdUser);
    expect(result).toEqual(createdUser);
  });

  it('should throw ConflictException if email already exists', async () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'test-avatar.png',
      role: Role.USER,
    };

    const existingUser: UserDocument = {
      _id: 'userId123',
      username: 'existinguser',
      email: 'test@example.com',
      password: 'hashedPassword',
      avatar: 'existing-avatar.png',
      role: 'user',
    } as UserDocument;

    authRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    expect(authRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(bcryptService.hashPassword).not.toHaveBeenCalled();
    expect(authRepository.create).not.toHaveBeenCalled();
    expect(emailService.sendRegistrationEmail).not.toHaveBeenCalled();
  });

  it('should hash the password before saving', async () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'test-avatar.png',
      role: Role.USER,
    };

    authRepository.findByEmail.mockResolvedValue(null);
    bcryptService.hashPassword.mockResolvedValue('hashedPassword123');
    authRepository.create.mockResolvedValue({} as UserDocument);

    await authService.register(registerDto);

    expect(bcryptService.hashPassword).toHaveBeenCalledWith(registerDto.password);
  });

  it('should send registration email after creating user', async () => {
    const registerDto: RegisterDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      avatar: 'test-avatar.png',
      role: Role.USER,
    };

    const createdUser: UserDocument = {
      _id: 'userId123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword123',
      avatar: 'test-avatar.png',
      role: 'user',
    } as UserDocument;

    authRepository.findByEmail.mockResolvedValue(null);
    bcryptService.hashPassword.mockResolvedValue('hashedPassword123');
    authRepository.create.mockResolvedValue(createdUser);

    await authService.register(registerDto);

    expect(emailService.sendRegistrationEmail).toHaveBeenCalledWith(createdUser);
  });
});

import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/users.schema';
import { AuthRepository } from './auth.repository';
import { EmailService } from '@/services/email/email.service';
import { BcryptService } from './bcrypt.service';
import { LoginDto } from './dto/login.dto';
import { UserRepository } from '../users/users.repository';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly userRepository: UserRepository
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email, password, avatar, role, ...userData } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the Password
    const hashedPassword = await this.bcryptService.hashPassword(password);

    // Create the User
    const newUser = await this.authRepository.create({
      ...userData,
      username,
      email,
      password: hashedPassword,
      avatar,
      role,
    });

    // Send Registration Email
    await this.emailService.sendRegistrationEmail(newUser);

    return newUser;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    //Find the user
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //Verify Password
    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //Generate Tokens
    const payload = { sub: user._id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      //verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const newPayload = { sub: user._id };
      const accessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
      });

      return { accessToken, refreshToken: newRefreshToken };

    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

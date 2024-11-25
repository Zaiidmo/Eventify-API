import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/users.schema';
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/services/email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    // private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email, password, avatar, role, ...userData} = registerDto;

    // Check if user already exists
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the Password
    const hashedPassword = await this.authRepository.hashPassword(password);

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
}

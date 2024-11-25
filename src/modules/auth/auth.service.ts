import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  registerUser(RegisterDto: RegisterDto) {
    return 'This action adds a new user';
  }

  loginUser(LoginDto: LoginDto) {
    return 'This action logs a user in';
  }
}

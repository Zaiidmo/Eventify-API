import { UsersService } from '@/modules/users/users.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { UserDocument } from '@/modules/users/users.schema';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    // console.log('AuthHeader:', authHeader);
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Authorization header missing or incorrect format');
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
  
    const token = authHeader.split(' ')[1];
    // console.log('Extracted Token:', token); 
  
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log('Decoded Token:', decoded); 
  
      // Fetch the user from the database and attach it to the request object
      const authUser = await this.userService.findById(decoded.sub); 
      if (!authUser) {
        console.log('User not found');
        throw new UnauthorizedException('User not found');
      }
  
      req['user'] = {
        _id: authUser._id.toString(),
        email: authUser.email,
        role: authUser.role,
      };
      console.log('Authenticated User:', req['user']);
      next();
    } catch (err) {
      console.error('Token verification error:', err.message);
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }  
}

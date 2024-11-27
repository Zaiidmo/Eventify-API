import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { UsersService } from '@/modules/users/users.service';
  import { Reflector } from '@nestjs/core';
  
  @Injectable()
  export class JwtGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
      private readonly userService: UsersService,
      private readonly reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // Check if the route is public
      const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
      if (isPublic) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid authorization header');
      }
  
      const token = authHeader.split(' ')[1];
  
      try {
        // Verify the token
        const decoded = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
  
        const user = await this.userService.findById(decoded._id);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
  
        request.user = {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
  
        return true;
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }
  
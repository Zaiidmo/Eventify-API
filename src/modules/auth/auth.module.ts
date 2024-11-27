import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/users.schema';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import { EmailService } from 'src/services/email/email.service';
import { MailerConfig } from 'src/config/mailer.config';
import { BcryptService } from './bcrypt.service';
import { UserRepository } from '../users/users.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    EmailService,
    MailerConfig,
    BcryptService,
    UserRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}

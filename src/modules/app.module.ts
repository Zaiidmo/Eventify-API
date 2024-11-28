import { Module } from '@nestjs/common';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from 'src/config/database.config';
import { RolesGuard } from '@/guards/roles.guard';
import { JwtGuard } from '@/guards/jwt.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    DatabaseConfig,
    AuthModule,
    UsersModule,
    EventsModule,
    RegistrationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: JwtGuard },
    { provide: 'APP_GUARD', useClass: RolesGuard },
  ],
})
export class AppModule {}

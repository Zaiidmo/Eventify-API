import { Module } from '@nestjs/common';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, EventsModule, RegistrationsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

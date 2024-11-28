import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationSchema } from './registrations.schema';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Registration', schema: RegistrationSchema }]), EventsModule],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationRepository],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}

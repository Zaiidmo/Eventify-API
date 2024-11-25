import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationSchema } from './registrations.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Registration', schema: RegistrationSchema }])],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
})
export class RegistrationsModule {}

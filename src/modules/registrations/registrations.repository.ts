import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Registration, RegistrationDocument } from './registrations.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationRepository {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
  ) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<RegistrationDocument> {
    const registration = new this.registrationModel(createRegistrationDto);
    return registration.save();
  }
  async findOne(filter: {
    user: string;
    event: string;
  }): Promise<RegistrationDocument | null> {
    return this.registrationModel.findOne(filter).exec();
  }
  async delete(filter: {
    user: string;
    event: string;
  }){
    return this.registrationModel.deleteOne(filter).exec();
  }

  async getEventsRegistrations(eventId: Types.ObjectId) {
    return this.registrationModel.find({ event: eventId }).exec();
  }

  async getUserRegistrations(userId: string) {
    return this.registrationModel.find({ user: userId }).populate('event').exec();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
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
  async delete(filter: { user: string; event: string }) {
    return this.registrationModel.deleteOne(filter).exec();
  }

  async getEventsRegistrations(eventId: Types.ObjectId) {
    return this.registrationModel.find({ event: eventId }).exec();
  }

  async getUserRegistrations(userId: Types.ObjectId) {
    const user = userId.toString();
    try {
      const result = await this.registrationModel.find({ user }).populate('event').populate('user').exec();
      console.log('result', result);
      return result;
    } catch (error) {
      console.error('Error fetching user registrations:', error);
      throw new Error('Failed to fetch user registrations');
    }
  }
}

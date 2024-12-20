import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';
import { ObjectId, Types } from 'mongoose';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
    private readonly eventRepository: EventRepository,
  ) {}
  async createRegistration(
    createRegistrationDto: CreateRegistrationDto,
    userId: string,
  ) {
    createRegistrationDto.user = userId;
    // createRegistrationDto.event = new Types.ObjectId(createRegistrationDto.event);
    const { event } = createRegistrationDto;

    // Fetch event details from MongoDB
    const eventDetails = await this.eventRepository.findById(event);

    if (!eventDetails) {
      throw new Error('Event does not exist.');
    }

    // const userId = new Types.ObjectId(user).toHexString();
    const eventId = new Types.ObjectId(event).toHexString();
    
    if(eventDetails.date < new Date()) {
      throw new BadRequestException('Event has already passed');
    }
    if(eventDetails.organizer.toString() === userId) {
      throw new BadRequestException('You cannot register for your own event');
    }


    // Check if the user is already registered for the event
    const existingRegistration = await this.registrationRepository.findOne({
      user: userId,
      event: eventId,
    });

    if (existingRegistration) {
      throw new HttpException('You are already registered for this event', 400);
    }

    // Ensure event has capacity
    if (eventDetails.capacity <= 0) {
      throw new Error('Event is full.');
    }

    // Create a new registration
    const registration = await this.registrationRepository.create(
      createRegistrationDto,
    );

    // Decrement event capacity in MongoDB
    await this.eventRepository.decrementCapacity(event);

    return {
      message: 'Registration successful',
      data: registration,
    };
  }
  async removeRegistration(userId: string, eventId: string) {
    const registration = await this.registrationRepository.delete({
      user: userId,
      event: eventId,
    });    

    if (registration.deletedCount === 0) {
      throw new NotFoundException('Registration not found.');
    }

    const event_id = new Types.ObjectId(eventId);

    // Increment event capacity in MongoDB
    await this.eventRepository.incrementCapacity(event_id);

    return registration;
  }

  async getEventsRegistrations(eventId: string, userId: Types.ObjectId): Promise<any> {
    const event_id = new Types.ObjectId(eventId);    
    const eventDetails = await this.eventRepository.findById(event_id);
    if (!eventDetails) {
      throw new NotFoundException('Event not found');
    }
    if (eventDetails.organizer.toString() !== userId.toString()) {
      throw new BadRequestException(
        'You are not authorized to view this resource',
      );
    }
    const participations = await this.registrationRepository.getEventsRegistrations(eventId);
    // console.log('response', participations);
    return {
      message: 'Event registrations',
      data: participations
    }
  }

  async getUserRegistrations(userId: Types.ObjectId) {
    try {
      const registrations = await this.registrationRepository.getUserRegistrations(userId);
      return registrations;
    } catch (error) {
      console.error('Error in RegistrationService:', error);
      throw new Error('Failed to get user registrations');
    }
  }
}

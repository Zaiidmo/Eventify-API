import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';
import { Types } from 'mongoose';

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

    // Check if the user is already registered for the event
    const existingRegistration = await this.registrationRepository.findOne({
      user: userId,
      event: eventId,
    });

    if (existingRegistration) {
      // throw new Error('You are already registered for this event.');
      return {
        message: 'You are already registered for this event.',
      };
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

    if (!registration) {
      throw new NotFoundException('Registration not found.');
    }

    const event_id = new Types.ObjectId(eventId);

    // Increment event capacity in MongoDB
    await this.eventRepository.incrementCapacity(event_id);

    return {
      message: 'Registration removed',
    };
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
    const participations = this.registrationRepository.getEventsRegistrations(event_id);
    return {
      message: 'Event registrations',
      data: participations
    }
  }
}

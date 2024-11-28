import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';

@Injectable()
export class RegistrationsService {
  constructor(
    private readonly registrationRepository: RegistrationRepository,
    private readonly eventRepository: EventRepository,
  ) {}
  async create(createRegistrationDto: CreateRegistrationDto): Promise<string> {
    //Check if event exists
    const event = this.eventRepository.findById(createRegistrationDto.event);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    //Check if user is already registered
    const existingRegistration = this.registrationRepository.findByUserAndEvent(createRegistrationDto.user, createRegistrationDto.event);
    if (existingRegistration) {
      throw new BadRequestException('You are already registered for this event');
    }
    //Check Event Capacity
    // if (event.capacity <= 0) {
    //   throw new BadRequestException('Event is fully booked');
    // }
    //Create Registration
    await this,this.registrationRepository.create(createRegistrationDto);
    //Decrement Event Capacity
    return 'Registration successful';
  }

  findAll() {
    return `This action returns all registrations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registration`;
  }

  update(id: number, updateRegistrationDto: UpdateRegistrationDto) {
    return `This action updates a #${id} registration`;
  }

  remove(id: number) {
    return `This action removes a #${id} registration`;
  }
}

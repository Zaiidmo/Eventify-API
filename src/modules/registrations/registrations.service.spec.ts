import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Types } from 'mongoose';
import { EventDocument } from '../events/events.schema';
import { RegistrationDocument } from './registrations.schema';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let registrationRepository: jest.Mocked<RegistrationRepository>;
  let eventRepository: jest.Mocked<EventRepository>;

  beforeEach(async () => {
    const mockRegistrationRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockEventRepo = {
      findById: jest.fn(),
      decrementCapacity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: RegistrationRepository, useValue: mockRegistrationRepo },
        { provide: EventRepository, useValue: mockEventRepo },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    registrationRepository = module.get(RegistrationRepository);
    eventRepository = module.get(EventRepository);
  });

  describe('createRegistration', () => {
    it('should throw an error if the event does not exist', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = 'userId';
    
      eventRepository.findById.mockResolvedValue(null); 
    
      await expect(service.createRegistration(mockDto, userId)).rejects.toThrowError(
        new Error('Event does not exist.')
      );
    });
    
    it('should throw an error if the event has already passed', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = 'userId';
    
      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: new Date('2023-01-01'), // Past date
        location: 'Sample Location',
        organizer: new Types.ObjectId(),
        capacity: 100,
      } as unknown as EventDocument;
    
      eventRepository.findById.mockResolvedValue(mockEvent);
    
      await expect(service.createRegistration(mockDto, userId)).rejects.toThrowError(
        new BadRequestException('Event has already passed')
      );
    });
    
    it('should throw an error if the user tries to register for their own event', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = new Types.ObjectId().toHexString(); 
      const eventDate = new Date('2030-01-01'); ;
      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: eventDate,
        location: 'Sample Location',
        organizer: new Types.ObjectId(userId),  
        capacity: 100,
      } as unknown as EventDocument;
    
      const mockRegistration = {
        id: 'registration-id',
        user: new Types.ObjectId(userId),  
        event: new Types.ObjectId(mockDto.event),
        registrationDate: new Date(),
      } as unknown as RegistrationDocument;
    
      // Mocking the repository calls
      eventRepository.findById.mockResolvedValue(mockEvent);  
      registrationRepository.findOne.mockResolvedValue(mockRegistration);
    
      await expect(service.createRegistration(mockDto, userId)).rejects.toThrowError(
        new HttpException('You cannot register for your own event', 400)
      );
    });
    
    
    it('should throw an error if the user is already registered for the event', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = new Types.ObjectId().toHexString(); 
      const eventDate = new Date('2030-01-01'); ;

      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: eventDate,
        location: 'Sample Location',
        organizer: new Types.ObjectId(),
        capacity: 100,
      } as unknown as EventDocument;
    
      const mockRegistration = {
        id: 'registration-id',
        user: new Types.ObjectId(userId),
        event: new Types.ObjectId(),
        registrationDate: new Date(),
      } as unknown as RegistrationDocument;
    
      eventRepository.findById.mockResolvedValue(mockEvent);
      registrationRepository.findOne.mockResolvedValue(mockRegistration);  
    
      await expect(service.createRegistration(mockDto, userId)).rejects.toThrowError(
        new HttpException('You are already registered for this event', 400)
      );
    });
    
    
    it('should throw an error if the event is full', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = 'userId';
      const eventDate = new Date('2030-01-01'); ;

      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: eventDate,
        location: 'Sample Location',
        organizer: new Types.ObjectId(),
        capacity: 0,  // Event full
      } as unknown as EventDocument;
    
      eventRepository.findById.mockResolvedValue(mockEvent);
    
      await expect(service.createRegistration(mockDto, userId)).rejects.toThrowError(
        new Error('Event is full.')
      );
    });
    
    it('should successfully create a registration if no errors occur', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = 'userId';
      const eventDate = new Date('2030-01-01'); ;
    
      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: eventDate,  
        location: 'Sample Location',
        organizer: new Types.ObjectId(),
        capacity: 100,
      } as unknown as EventDocument;
    
      const mockRegistration = {
        id: 'registration-id',
        user: new Types.ObjectId(),
        event: new Types.ObjectId(),
        registrationDate: new Date(),
      } as unknown as RegistrationDocument;
    
      eventRepository.findById.mockResolvedValue(mockEvent);
      registrationRepository.findOne.mockResolvedValue(null);  // No existing registration
      registrationRepository.create.mockResolvedValue(mockRegistration);
    
      await expect(service.createRegistration(mockDto, userId)).resolves.toEqual({
        message: 'Registration successful',
        data: mockRegistration,
      });
    });
  });
});

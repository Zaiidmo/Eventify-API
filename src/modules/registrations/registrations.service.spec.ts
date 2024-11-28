import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { RegistrationRepository } from './registrations.repository';
import { EventRepository } from '../events/events.repository';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Types } from 'mongoose';
import { EventDocument } from '../events/events.schema';
import { RegistrationDocument } from './registrations.schema';

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
        event: new Types.ObjectId(),
        user: 'userId',
      };
      const userId = 'userId';

      eventRepository.findById.mockResolvedValue(null);

      await expect(service.createRegistration(mockDto, userId)).rejects.toThrow(
        'Event does not exist.',
      );
      expect(eventRepository.findById).toHaveBeenCalledWith(mockDto.event);
    });

    it('should return a message if the user is already registered', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId('6748470e29161eed22749ccb'),
        user: 'userId',
      };
      const userId = 'userId';

      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: new Date(),
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
      registrationRepository.findOne.mockResolvedValue(mockRegistration);

      const result = await service.createRegistration(mockDto, userId);

      expect(result).toEqual({
        message: 'You are already registered for this event.',
      });
    });

    it('should throw an error if the event is full', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId(),
        user: 'userId',
      };
      const userId = 'userId';

      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: new Date(),
        location: 'Sample Location',
        organizer: new Types.ObjectId(),
        capacity: 0,
    } as unknown as EventDocument;

      eventRepository.findById.mockResolvedValue(mockEvent);
      registrationRepository.findOne.mockResolvedValue(null);

      await expect(service.createRegistration(mockDto, userId)).rejects.toThrow(
        'Event is full.',
      );
    });

    it('should create a registration and decrement event capacity', async () => {
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId(),
        user: 'userId',
      };
      const userId = 'userId';

      const mockEvent = {
        id: new Types.ObjectId(),
        title: 'Sample Event',
        description: 'A sample description',
        date: new Date(),
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
      registrationRepository.findOne.mockResolvedValue(null);
      registrationRepository.create.mockResolvedValue(mockRegistration);

      const result = await service.createRegistration(mockDto, userId);

      expect(result).toEqual({
        message: 'Registration successful',
        data: mockRegistration,
      });
      expect(registrationRepository.create).toHaveBeenCalledWith({
        event: mockDto.event,
        user: userId,
      });
      expect(eventRepository.decrementCapacity).toHaveBeenCalledWith(
        mockDto.event,
      );
    });
  });
});

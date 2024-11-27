import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventRepository } from './events.repository';
import { Event, EventDocument } from './events.schema';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

// Mock Event Repository
const mockEventRepository = {
  create: jest.fn(),
};

describe('EventsService', () => {
  let eventsService: EventsService;
  let eventRepository: EventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventRepository, useValue: mockEventRepository },
      ],
    }).compile();

    eventsService = module.get<EventsService>(EventsService);
    eventRepository = module.get<EventRepository>(EventRepository);
  });

  it('should be defined', () => {
    expect(eventsService).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a new event successfully', async () => {
      // Arrange: Setup input and mock return values
      const createEventDto = {
        title: 'Test Event',
        description: 'Test description',
        organizer: new Types.ObjectId('000000000000000000000001'),
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
      };

      const bannerPath = 'path/to/banner.jpg';
      const organizer = new Types.ObjectId();

      const mockEvent: any = {
        _id: new Types.ObjectId(),
        title: 'Test Event',
        description: 'Test description',
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
        banner: bannerPath,
        organizer,
      };

      // Mock the repository's create method
      mockEventRepository.create.mockResolvedValue(mockEvent);

      // Act: Call the service method
      const result = await eventsService.createEvent(createEventDto, bannerPath, organizer);

      // Assert: Check if the result matches the expected outcome
      expect(result).toEqual(mockEvent);
      expect(eventRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        banner: bannerPath,
        organizer,
      });
    });

    it('should return null if the bannerPath is not provided', async () => {
      // Arrange: Setup input and mock return values
      const createEventDto = {
        title: 'Test Event',
        description: 'Test description',
        organizer: new Types.ObjectId('000000000000000000000001'),
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
      };

      const bannerPath = null;
      const organizer = new Types.ObjectId();

      const mockEvent: any = {
        _id: new Types.ObjectId(),
        title: 'Test Event',
        description: 'Test description',
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
        banner: null,
        organizer,

      };

      // Mock the repository's create method
      mockEventRepository.create.mockResolvedValue(mockEvent);

      // Act: Call the service method
      const result = await eventsService.createEvent(createEventDto, bannerPath, organizer);

      // Assert: Check if the result matches the expected outcome
      expect(result).toEqual(mockEvent);
      expect(eventRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        banner: null,
        organizer,
      });
    });
  });
});

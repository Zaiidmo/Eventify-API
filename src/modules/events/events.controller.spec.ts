import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Request } from 'express';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  const mockRequest = {
    user: {
      _id: new Types.ObjectId('674766b333296d40ec4eb94f'), // Mocked authenticated user
    },
  };

  const mockEventService = {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should successfully create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        date: new Date(),
        description: 'Test description',
        location: 'Test location',
        capacity: 100,
        organizer: mockRequest.user._id,
      };
  
      const file = { path: 'banner-path' } as Express.Multer.File;
  
      // Mock service response
      mockEventService.createEvent.mockResolvedValue({
        _id: new Types.ObjectId(),
        ...createEventDto,
        banner: file.path,
        organizer: mockRequest.user._id,
      });
  
      const response = await controller.createEvent(
        createEventDto,
        file,
        mockRequest as unknown as Request, // Properly cast mockRequest as Request
      );
      expect(response.message).toBe('Event created successfully');
      expect(response.data.title).toBe(createEventDto.title);
      expect(response.data.banner).toBe(file.path);
    });
  
    it('should throw an error when event creation fails', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        date: new Date(),
        description: 'Test description',
        location: 'Test location',
        capacity: 100,
        organizer: mockRequest.user._id,
      };
      const file = { path: 'banner-path' } as Express.Multer.File;
  
      mockEventService.createEvent.mockRejectedValue(
        new Error('Event creation failed'),
      );
  
      try {
        await controller.createEvent(
          createEventDto,
          file,
          mockRequest as unknown as Request, 
        );
      } catch (error) {
        expect(error.message).toBe('Event creation failed');
      }
    });
  });

  describe('updateEvent', () => {
    it('should successfully update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file = { path: 'new-banner-path' } as Express.Multer.File;
      const eventId = new Types.ObjectId().toString();

      // Mock service response
      mockEventService.updateEvent.mockResolvedValue({
        _id: eventId,
        title: updateEventDto.title,
        banner: file.path,
      });

      const response = await controller.updateEvent(
        eventId,
        updateEventDto,
        file,
        mockRequest as any,
      );

      expect(response.message).toBe('Event updated successfully');
      expect(response.data.title).toBe(updateEventDto.title);
      expect(response.data.banner).toBe(file.path);
    });

    it('should throw NotFoundException when the event is not found', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file = { path: 'new-banner-path' } as Express.Multer.File;
      const eventId = new Types.ObjectId().toString();

      mockEventService.updateEvent.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      try {
        await controller.updateEvent(eventId, updateEventDto, file, mockRequest);
      } catch (error) {
        expect(error.response.message).toBe('Event not found');
      }
    });

    it('should throw ForbiddenException when the user is not authorized to update the event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file = { path: 'new-banner-path' } as Express.Multer.File;
      const eventId = new Types.ObjectId().toString();

      mockEventService.updateEvent.mockRejectedValue(
        new ForbiddenException('Not authorized'),
      );

      try {
        await controller.updateEvent(eventId, updateEventDto, file, mockRequest);
      } catch (error) {
        expect(error.response.message).toBe('Not authorized');
      }
    });
  });
});

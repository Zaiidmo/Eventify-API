import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
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
    deleteEvent: jest.fn(),
    getUpcomingEvents: jest.fn(),
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

  describe('deleteEvent', () => {
    it('should successfully delete an event', async () => {
      const eventId = new Types.ObjectId('674766b333296d40ec4eb94f');
  
      // Mock service response
      mockEventService.deleteEvent.mockResolvedValue({
        id: eventId,
        message: 'Event deleted successfully',
      });
  
      const response = await controller.deleteEvent(eventId, mockRequest as any);
  
      expect(response.message).toBe('Event deleted successfully');
      // expect(response.id).toBe(eventId);
      expect(mockEventService.deleteEvent).toHaveBeenCalledWith(eventId, mockRequest.user._id);
    });
  
    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId();
  
      mockEventService.deleteEvent.mockRejectedValue(new NotFoundException('Event not found'));
  
      try {
        await controller.deleteEvent(eventId, mockRequest as any);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.response.message).toBe('Event not found');
      }
    });
  
    it('should throw UnauthorizedException if user is not authorized', async () => {
      const eventId = new Types.ObjectId();
  
      mockEventService.deleteEvent.mockRejectedValue(new UnauthorizedException('Not authorized'));
  
      try {
        await controller.deleteEvent(eventId, mockRequest as any);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.response.message).toBe('Not authorized');
      }
    });
  
    it('should throw an error if event deletion fails', async () => {
      const eventId = new Types.ObjectId();
  
      mockEventService.deleteEvent.mockRejectedValue(new Error('Event deletion failed'));
  
      try {
        await controller.deleteEvent(eventId, mockRequest as any);
      } catch (error) {
        expect(error.message).toBe('Event deletion failed');
      }
    });
  });

  describe('findUpcomingEvents', () => {
    it('should return a list of upcoming events', async () => {
      const upcomingEvents = [
        { title: 'Event 1', date: new Date() },
        { title: 'Event 2', date: new Date() },
      ];
  
      mockEventService.getUpcomingEvents.mockResolvedValue(upcomingEvents);
  
      const response = await controller.findUpcomingEvents();
  
      expect(response.message).toBe('Upcoming events fetched successfully');
      expect(response.data).toEqual(upcomingEvents);
      expect(mockEventService.getUpcomingEvents).toHaveBeenCalled();
    });
  
    it('should throw an error if fetching upcoming events fails', async () => {
      mockEventService.getUpcomingEvents.mockRejectedValue(new Error('Failed to fetch upcoming events'));
  
      try {
        await controller.findUpcomingEvents();
      } catch (error) {
        expect(error.message).toBe('Failed to fetch upcoming events');
      }
    });
  });
});

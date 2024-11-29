import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { UploadService } from '@/upload/providers/upload.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Types } from 'mongoose';
import { Role } from '../users/users.schema';
import { BadRequestException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;
  let uploadService: UploadService;

  const mockRequest = {
    user: {
      _id: new Types.ObjectId()
    },
  };

  const mockEventsService = {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
    getAllEvents: jest.fn(),
    getUpcomingEvents: jest.fn(),
    getLatestEvent: jest.fn(),
  };

  const mockUploadService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
    uploadService = module.get<UploadService>(UploadService);
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        organizer: mockRequest.user._id,
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
      };
      const file = { path: 'path/to/banner' } as Express.Multer.File;
      const bannerUrl = 'http://example.com/banner.jpg';
      const event = { ...createEventDto, banner: bannerUrl };

      mockUploadService.uploadFile.mockResolvedValue({ url: bannerUrl });
      mockEventsService.createEvent.mockResolvedValue(event);

      const result = await controller.createEvent(createEventDto, file, mockRequest as any);

      expect(result.message).toBe('Event created successfully');
      expect(result.data).toEqual(event);
      expect(uploadService.uploadFile).toHaveBeenCalledWith(file);
      expect(eventsService.createEvent).toHaveBeenCalledWith(createEventDto, bannerUrl, mockRequest.user._id);
    });

    it('should throw BadRequestException if file upload fails', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        organizer: mockRequest.user._id,
        description: 'Test Description',
        date: new Date(),
        location: 'Test Location',
        capacity: 100,
      };
      const file = { path: 'path/to/banner' } as Express.Multer.File;

      mockUploadService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(controller.createEvent(createEventDto, file, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Failed to upload banner: Upload failed'),
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        description: 'Updated Description',
        date: new Date(),
        location: 'Updated Location',
      };
      const file = { path: 'path/to/banner' } as Express.Multer.File;
      const bannerUrl = 'http://example.com/banner.jpg';
      const eventId = new Types.ObjectId().toHexString();
      const event = { ...updateEventDto, banner: bannerUrl };

      mockUploadService.uploadFile.mockResolvedValue({ url: bannerUrl });
      mockEventsService.updateEvent.mockResolvedValue(event);

      const result = await controller.updateEvent(eventId, updateEventDto, file, mockRequest as any);

      expect(result.message).toBe('Event updated successfully');
      expect(result.data).toEqual(event);
      expect(uploadService.uploadFile).toHaveBeenCalledWith(file);
      expect(eventsService.updateEvent).toHaveBeenCalledWith(
        new Types.ObjectId(eventId),
        updateEventDto,
        bannerUrl,
        mockRequest.user._id,
      );
    });

    it('should throw BadRequestException if file upload fails', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        description: 'Updated Description',
        date: new Date(),
        location: 'Updated Location',
      };
      const file = { path: 'path/to/banner' } as Express.Multer.File;
      const eventId = new Types.ObjectId().toHexString();

      mockUploadService.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(controller.updateEvent(eventId, updateEventDto, file, mockRequest as any)).rejects.toThrow(
        new BadRequestException('Failed to upload banner: Upload failed'),
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const eventId = new Types.ObjectId().toHexString();
      const response = { id: eventId, message: 'Event deleted successfully' };

      mockEventsService.deleteEvent.mockResolvedValue(response);

      const result = await controller.deleteEvent(new Types.ObjectId(eventId), mockRequest as any);

      expect(result.message).toBe('Event deleted successfully');
      expect(result.data).toEqual(response);
      expect(eventsService.deleteEvent).toHaveBeenCalledWith(new Types.ObjectId(eventId), mockRequest.user._id);
    });

    it('should return an error if deletion fails', async () => {
      const eventId = new Types.ObjectId().toHexString();
      const errorMessage = 'Deletion failed';

      mockEventsService.deleteEvent.mockRejectedValue(new Error(errorMessage));

      const result = await controller.deleteEvent(new Types.ObjectId(eventId), mockRequest as any);

      expect(result.status).toBe('error');
      expect(result.message).toBe(errorMessage);
    });
  });

  describe('findAllEvents', () => {
    it('should return all events', async () => {
      const events = [{ title: 'Event 1' }, { title: 'Event 2' }];

      mockEventsService.getAllEvents.mockResolvedValue(events);

      const result = await controller.findAllEvents();

      expect(result.message).toBe('Events fetched successfully');
      expect(result.data).toEqual(events);
      expect(eventsService.getAllEvents).toHaveBeenCalled();
    });

    it('should throw an error if fetching events fails', async () => {
      const errorMessage = 'Fetching failed';

      mockEventsService.getAllEvents.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findAllEvents()).rejects.toThrow(new Error(errorMessage));
    });
  });

  describe('findUpcomingEvents', () => {
    it('should return upcoming events', async () => {
      const events = [{ title: 'Upcoming Event 1' }, { title: 'Upcoming Event 2' }];

      mockEventsService.getUpcomingEvents.mockResolvedValue(events);

      const result = await controller.findUpcomingEvents();

      expect(result.message).toBe('Upcoming events fetched successfully');
      expect(result.data).toEqual(events);
      expect(eventsService.getUpcomingEvents).toHaveBeenCalled();
    });

    it('should throw an error if fetching upcoming events fails', async () => {
      const errorMessage = 'Fetching failed';

      mockEventsService.getUpcomingEvents.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findUpcomingEvents()).rejects.toThrow(new Error(errorMessage));
    });
  });

  describe('findLatestEvent', () => {
    it('should return the latest event', async () => {
      const event = { title: 'Latest Event' };

      mockEventsService.getLatestEvent.mockResolvedValue(event);

      const result = await controller.findLatestEvent();

      expect(result).toEqual(event);
      expect(eventsService.getLatestEvent).toHaveBeenCalled();
    });

    it('should throw an error if fetching the latest event fails', async () => {
      const errorMessage = 'Fetching failed';

      mockEventsService.getLatestEvent.mockRejectedValue(new Error(errorMessage));

      await expect(controller.findLatestEvent()).rejects.toThrow(new Error(errorMessage));
    });
  });
});
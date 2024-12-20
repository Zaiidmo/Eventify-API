import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventRepository } from './events.repository';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventDocument } from './events.schema';

describe('EventsService', () => {
  let service: EventsService;
  let repository: EventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            updateEvent: jest.fn(),
            delete: jest.fn(),
            findUpcomingEvents: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<EventRepository>(EventRepository);
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        date: new Date(),
        capacity: 100,
        organizer: new Types.ObjectId(),
      };
      const bannerPath = 'path/to/banner';
      const organizer = new Types.ObjectId();
      const eventDocument: EventDocument = {
        ...createEventDto,
        banner: bannerPath,
        organizer,
      } as EventDocument;

      jest.spyOn(repository, 'create').mockResolvedValue(eventDocument);

      const result = await service.createEvent(
        createEventDto,
        bannerPath,
        organizer,
      );
      expect(result).toEqual(eventDocument);
      expect(repository.create).toHaveBeenCalledWith({
        ...createEventDto,
        banner: bannerPath,
        organizer,
      });
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      const events: EventDocument[] = [
        { title: 'Test Event' } as EventDocument,
      ];

      jest.spyOn(repository, 'findAll').mockResolvedValue(events);

      const result = await service.getAllEvents();
      expect(result).toEqual(events);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('getEventById', () => {
    it('should return the event if found', async () => {
      const eventId = new Types.ObjectId();
      const event: EventDocument = { title: 'Test Event' } as EventDocument;

      jest.spyOn(repository, 'findById').mockResolvedValue(event);

      const result = await service.getEventById(eventId);
      expect(result).toEqual(event);
      expect(repository.findById).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId();

      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.getEventById(eventId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update the event if found and user is authorized', async () => {
      const eventId = new Types.ObjectId();
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file: Express.Multer.File = {
        path: 'path/to/new/banner',
      } as Express.Multer.File;
      const authenticatedUser = new Types.ObjectId();
      const event: EventDocument = {
        title: 'Test Event',
        organizer: authenticatedUser,
      } as EventDocument;
      const updatedEvent: EventDocument = {
        ...event,
        ...updateEventDto,
        banner: file.path,
      } as EventDocument;

      jest.spyOn(service, 'getEventById').mockResolvedValue(event);
      jest.spyOn(repository, 'updateEvent').mockResolvedValue(updatedEvent);

      const result = await service.updateEvent(
        eventId,
        updateEventDto,
        file,
        authenticatedUser,
      );
      expect(result).toEqual(updatedEvent);
      expect(repository.updateEvent).toHaveBeenCalledWith(eventId, {
        ...updateEventDto,
        banner: file.path,
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId();
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file: Express.Multer.File = {
        path: 'path/to/new/banner',
      } as Express.Multer.File;
      const authenticatedUser = new Types.ObjectId();

      jest.spyOn(service, 'getEventById').mockResolvedValue(null);

      await expect(
        service.updateEvent(eventId, updateEventDto, file, authenticatedUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user is not authorized', async () => {
      const eventId = new Types.ObjectId();
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
        date: new Date(),
      };
      const file: Express.Multer.File = {
        path: 'path/to/new/banner',
      } as Express.Multer.File;
      const authenticatedUser = new Types.ObjectId();
      const event: EventDocument = {
        title: 'Test Event',
        organizer: new Types.ObjectId(),
      } as EventDocument;

      jest.spyOn(service, 'getEventById').mockResolvedValue(event);

      await expect(
        service.updateEvent(eventId, updateEventDto, file, authenticatedUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvent', () => {
    it('should delete the event if found and user is authorized', async () => {
      const eventId = new Types.ObjectId();
      const authenticatedUser = new Types.ObjectId();
      const event: EventDocument = { title: 'Test Event', organizer: authenticatedUser } as EventDocument;

      jest.spyOn(service, 'getEventById').mockResolvedValue(event);
      jest.spyOn(repository, 'delete').mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteEvent(eventId, authenticatedUser);
      expect(result).toEqual({ id: eventId, message: 'Event deleted successfully' });
      expect(repository.delete).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException if event not found', async () => {
      const eventId = new Types.ObjectId();
      const authenticatedUser = new Types.ObjectId();

      jest.spyOn(service, 'getEventById').mockResolvedValue(null);

      await expect(service.deleteEvent(eventId, authenticatedUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if user is not authorized', async () => {
      const eventId = new Types.ObjectId();
      const authenticatedUser = new Types.ObjectId();
      const event: EventDocument = { title: 'Test Event', organizer: new Types.ObjectId() } as EventDocument;

      jest.spyOn(service, 'getEventById').mockResolvedValue(event);

      await expect(service.deleteEvent(eventId, authenticatedUser)).rejects.toThrow(UnauthorizedException);
      await expect(service.deleteEvent(eventId, authenticatedUser)).rejects.toThrow('You are not authorized to delete this event');
    });

    it('should throw an error if event deletion fails', async () => {
      const eventId = new Types.ObjectId();
      const authenticatedUser = new Types.ObjectId();
      const event: EventDocument = { title: 'Test Event', organizer: authenticatedUser } as EventDocument;

      jest.spyOn(service, 'getEventById').mockResolvedValue(event);
      jest.spyOn(repository, 'delete').mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteEvent(eventId, authenticatedUser)).rejects.toThrow(Error);
    });
  });
  
  describe('getUpcomingEvents', () => {
    it('should return a list of upcoming events', async () => {
      const upcomingEvents = [
        { title: 'Event 1', date: new Date() },
        { title: 'Event 2', date: new Date() },
      ] as EventDocument[];
  
      jest.spyOn(repository, 'findUpcomingEvents').mockResolvedValue(upcomingEvents);
  
      const result = await service.getUpcomingEvents();
      expect(result).toEqual(upcomingEvents);
      expect(repository.findUpcomingEvents).toHaveBeenCalled();
    });
  
    it('should throw an error if fetching upcoming events fails', async () => {
      jest.spyOn(repository, 'findUpcomingEvents').mockRejectedValue(new Error('Failed to fetch upcoming events'));
  
      await expect(service.getUpcomingEvents()).rejects.toThrow('Failed to fetch upcoming events');
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RegistrationsController', () => {
  let controller: RegistrationsController;
  let service: RegistrationsService;

  const mockRequest: any = {
    user: {
      _id: 'someUserId',
    },
  };
  beforeEach(async () => {
    const mockService = {
      createRegistration: jest.fn(),
      removeRegistration: jest.fn(),
      getEventsRegistrations: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationsController],
      providers: [
        {
          provide: RegistrationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RegistrationsController>(RegistrationsController);
    service = module.get<RegistrationsService>(RegistrationsService);
  });

  describe('create', () => {
    it('should call RegistrationsService.createRegistration with correct parameters', async () => {
      // Arrange
      const mockDto: any = {
        event: new Types.ObjectId(),
        user: mockRequest.user._id.toString(),
      };

      const mockResponse = {
        message: 'Success',
        data: mockDto,
      };

      jest
        .spyOn(service, 'createRegistration')
        .mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.create(mockDto, mockRequest);

      // Assert
      expect(service.createRegistration).toHaveBeenCalledWith(
        mockDto,
        mockRequest.user._id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if RegistrationsService.createRegistration fails', async () => {
      // Arrange
      const mockDto: CreateRegistrationDto = {
        event: new Types.ObjectId(),
        user: mockRequest.user._id.toString(),
      };

      jest
        .spyOn(service, 'createRegistration')
        .mockRejectedValueOnce(new Error('Service error'));

      // Act & Assert
      await expect(controller.create(mockDto, mockRequest)).rejects.toThrow(
        'Service error',
      );
    });
  });
  describe('removeRegistration', () => {
    it('should call RegistrationsService.removeRegistration with correct parameters', async () => {
      const eventId = new Types.ObjectId().toString();
      const mockResponse = { acknowledged: true, deletedCount: 1 };

      jest
        .spyOn(service, 'removeRegistration')
        .mockResolvedValueOnce(mockResponse);

      const result = await controller.remove(eventId, mockRequest);

      expect(service.removeRegistration).toHaveBeenCalledWith(
        mockRequest.user._id,
        eventId,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if RegistrationsService.removeRegistration fails', async () => {
      const eventId = new Types.ObjectId().toString();

      jest
        .spyOn(service, 'removeRegistration')
        .mockRejectedValueOnce(new NotFoundException('Registration not found'));

      await expect(
        controller.remove(eventId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEventsRegistrations', () => {
    it('should return event registrations if the user is the organizer', async () => {
      const eventId = new Types.ObjectId().toString();
      const mockResponse = {
        message: 'Event registrations',
        data: [{ user: 'user1' }, { user: 'user2' }],
      };

      jest
        .spyOn(service, 'getEventsRegistrations')
        .mockResolvedValueOnce(mockResponse);

      const result = await controller.getEventRegistrations(
        eventId,
        mockRequest,
      );

      expect(service.getEventsRegistrations).toHaveBeenCalledWith(
        eventId,
        mockRequest.user._id,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if the event does not exist', async () => {
      const eventId = new Types.ObjectId().toString();

      jest
        .spyOn(service, 'getEventsRegistrations')
        .mockRejectedValueOnce(new NotFoundException('Event not found'));

      await expect(
        controller.getEventRegistrations(eventId, mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if the user is not authorized', async () => {
      const eventId = new Types.ObjectId().toString();

      jest
        .spyOn(service, 'getEventsRegistrations')
        .mockRejectedValueOnce(
          new BadRequestException(
            'You are not authorized to view this resource',
          ),
        );

      await expect(
        controller.getEventRegistrations(eventId, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
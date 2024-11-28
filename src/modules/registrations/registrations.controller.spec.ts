import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Types } from 'mongoose';

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
});

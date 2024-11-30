import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { Request as req } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '../users/users.schema';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Create a new registration
  @Post()
  create(
    @Body() createRegistrationDto: CreateRegistrationDto,
    @Request() request: req,
  ): Promise<any> {
    const user = request.user._id.toString();
    try {
      return this.registrationsService.createRegistration(
        createRegistrationDto,
        user,
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete a regestration
  @Delete(':id')
  remove(@Param('id') id: string, @Request() request: req) {
    const user = request.user._id.toString();
    try {
      return this.registrationsService.removeRegistration(user, id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get all registrations for an event
  @Get('events/:id')
  @Roles(Role.ORGANIZER, Role.ADMIN)
  async getEventRegistrations(
    @Param('id') id: string,
    @Request() request: req,
  ) {
    try {
      const user = request.user._id;
      return this.registrationsService.getEventsRegistrations(id, user);
    } catch (error) {
      throw new Error(error);
    }
  }

  // Get all registrations for a user
  @Get('user')
  async getUserRegistrations(@Request() request: req) {
    try {
      const user = request.user._id;
      const registrations = await this.registrationsService.getUserRegistrations(user);
      return {
        message: 'User registrations fetched successfully',
        data: registrations,
      };
    } catch (error) {
      console.error('Error in RegistrationController:', error);
      throw new Error('Failed to fetch user registrations');
    }
  }
}

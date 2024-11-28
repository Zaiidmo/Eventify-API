import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  Request,
  Delete,
  Get,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '../users/users.schema';
import { multerConfig } from '@/config/multer.config';
import { Request as REQ } from 'express';
import { UpdateEventDto } from './dto/update-event.dto';
import { Types } from 'mongoose';
import { Public } from '@/common/decorators/public.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  // Create a new event
  @Post('create')
  @Roles(Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('banner', multerConfig))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: REQ,
  ) {
    const bannerPath = file ? file.path : null;
    const organizerId = request.user._id;
    console.log('organizerId', organizerId);

    const event = await this.eventsService.createEvent(
      createEventDto,
      bannerPath,
      organizerId,
    );
    return {
      message: 'Event created successfully',
      data: event,
    };
  }

  //Update an event
  @Patch('update/:id')
  @Roles(Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('banner', multerConfig))
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const _eventId = new Types.ObjectId(eventId);

    const authenticatedUser = req.user._id;
    console.log('authenticatedUser', authenticatedUser);

    const event = await this.eventsService.updateEvent(
      _eventId,
      updateEventDto,
      file,
      authenticatedUser,
    );
    return {
      message: 'Event updated successfully',
      data: event,
    };
  }

  // Delete an Event
  @Delete('delete/:id')
  @Roles(Role.ORGANIZER)
  async deleteEvent(@Param('id') id: Types.ObjectId, @Request() req: any) {
    const authenticatedUser = req.user._id;
    try {
      const response = await this.eventsService.deleteEvent(
        id,
        authenticatedUser,
      );
      return {
        status: 'success',
        message: 'Event deleted successfully',
        data: response,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Something went wrong',
        error: error.response || error,
      };
    }
  }

  // Fetch all events
  @Get('all')
  @Public()
  async findAllEvents() {
    try {
      const events = await this.eventsService.getAllEvents();
      return {
        message: 'Events fetched successfully',
        data: events,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Fetch Upcoming Events
  @Get('upcoming')
  @Public()
  async findUpcomingEvents() {
    try {
      const events = await this.eventsService.getUpcomingEvents();
      return {
        message: 'Upcoming events fetched successfully',
        data: events,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

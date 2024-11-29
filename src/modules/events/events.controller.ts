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
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '../users/users.schema';
import { Request as REQ } from 'express';
import { UpdateEventDto } from './dto/update-event.dto';
import { Types } from 'mongoose';
import { Public } from '@/common/decorators/public.decorator';
import { UploadService } from '@/upload/providers/upload.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly uploadService: UploadService,
  ) {}

  // Create a new event
  @Post('create')
  @Roles(Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('banner'))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() request: REQ,
  ) {
    const organizerId = request.user._id;
    console.log('organizerId', organizerId);

    let bannerUrl = null;
    if (file) {
      try {
        const uploadResult = await this.uploadService.uploadFile(file);
        bannerUrl = uploadResult.url;
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload banner: ${error.message}`,
        );
      }
    }

    const event = await this.eventsService.createEvent(
      createEventDto,
      bannerUrl, // Pass the S3 URL
      organizerId,
    );
    return {
      message: 'Event created successfully',
      data: event,
    };
  }

  // Update an event
  @Patch('update/:id')
  @Roles(Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('banner'))
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const _eventId = new Types.ObjectId(eventId);
    const authenticatedUser = req.user._id;
    console.log('authenticatedUser', authenticatedUser);

    let bannerUrl = null;
    if (file) {
      try {
        const uploadResult = await this.uploadService.uploadFile(file);
        bannerUrl = uploadResult.url;
      } catch (error) {
        throw new BadRequestException(
          `Failed to upload banner: ${error.message}`,
        );
      }
    }

    const event = await this.eventsService.updateEvent(
      _eventId,
      updateEventDto,
      bannerUrl, // Pass the S3 URL
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

  // Fetch the latest shared event
  @Get('latest')
  @Public()
  async findLatestEvent() {
    try {
      const event = await this.eventsService.getLatestEvent();
      return event;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get popular locations
  @Get('popular-locations')
  @Public()
  async getPopularLocations() {
    const locations = await this.eventsService.getPopularLocations();
    return {
      message: 'Popular locations fetched successfully',
      data: locations,
    };
  }

  // Get top organizers
  @Get('top-organizers')
  @Public()
  async getTopOrganizers() {
    const organizers = await this.eventsService.getTopOrganizers();
    return {
      message: 'Top organizers fetched successfully',
      data: organizers,
    };
  }

  // Get past events
  @Get('past-events')
  @Public()
  async getPastEvents() {
    const events = await this.eventsService.getPastEvents();
    return {
      message: 'Past events fetched successfully',
      data: events,
    };
  }
}

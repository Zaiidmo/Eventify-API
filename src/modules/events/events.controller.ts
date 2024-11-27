import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '../users/users.schema';
import { multerConfig } from '@/config/multer.config';
import { Request } from 'express';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('create')
  @Roles(Role.ORGANIZER)
  @UseInterceptors(FileInterceptor('banner', multerConfig))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const bannerPath = file ? file.path : null;
    const organizerId = Request['user']._id;
    // console.log('organizerId', organizerId);
    
    const event = await this.eventsService.createEvent(createEventDto, bannerPath, organizerId);
    return {
      message: 'Event created successfully',
      data: event,
    }
  }
}

import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './events.schema';
import { MulterModule } from '@nestjs/platform-express';
import { EventRepository } from './events.repository';
import { UploadModule } from '@/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Event', schema: EventSchema }]),
    UploadModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
  exports: [EventsService, EventRepository],
})
export class EventsModule {}

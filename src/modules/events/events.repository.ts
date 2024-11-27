import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './events.schema';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
  ) {}

  // Create a new event
  async create(eventData: Partial<Event>): Promise<Event> {
    const event = new this.eventModel(eventData);
    return event.save();
  }

  // Find all events
  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  // Find an event by ID
  async findById(id: string): Promise<Event | null> {
    return this.eventModel.findById(id).exec();
  }

  // Update an event
  async update(
    id: string,
    updateEventDto: Partial<CreateEventDto>,
  ): Promise<Event | null> {
    return this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
  }

  // Delete an event
  async delete(id: string): Promise<Event | null> {
    return this.eventModel.findByIdAndDelete(id).exec();
  }

  // Find upcoming events
  async findUpcomingEvents(): Promise<Event[]> {
    return this.eventModel
      .find({
        date: { $gte: new Date() },
        isPublished: true,
      })
      .sort({ date: 1 })
      .exec();
  }

  // Find events by location
  async findEventsByLocation(location: string): Promise<Event[]> {
    return this.eventModel.find({ location }).exec();
  }
}

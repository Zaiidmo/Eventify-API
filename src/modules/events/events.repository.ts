import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './events.schema';

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  // Create a new event
  async create(eventData: Partial<EventDocument>): Promise<EventDocument> {
    const event = new this.eventModel(eventData);
    return event.save();
  }

  // Fetch all events
  async findAll(): Promise<EventDocument[]> {
    return this.eventModel.find().exec();
  }

  // Fetch a single event by ID
  async findById(eventId: Types.ObjectId): Promise<EventDocument | null> {
    return this.eventModel.findById(eventId).exec();
  }

  async updateEvent(
    eventId: Types.ObjectId,
    eventData: Partial<EventDocument>,
  ): Promise<EventDocument> {
    return this.eventModel
      .findByIdAndUpdate(eventId, eventData, { new: true })
      .exec();
  }

  // Delete an event
  async delete(eventId: Types.ObjectId): Promise<any> {
    return await this.eventModel.deleteOne({ _id: eventId }).exec();
  }

  // Find upcoming events
  async findUpcomingEvents(): Promise<Event[]> {
    return this.eventModel
      .find({
        date: { $gte: new Date() },
      })
      .sort({ date: 1 })
      .exec();
  }

  //Decrement event capacity
  async decrementCapacity(eventId: Types.ObjectId): Promise<any> {
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $inc: { capacity: -1 },
        },
        { new: true },
      )
      .exec();
  }

  // Increment event capacity
  async incrementCapacity(eventId: Types.ObjectId): Promise<any> {
    return this.eventModel
      .findByIdAndUpdate(
        eventId,
        {
          $inc: { capacity: 1 },
        },
        { new: true },
      )
      .exec();
  }

  // Get the latest event
  async findLatestEvent(): Promise<EventDocument> {
    return this.eventModel
      .findOne()
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();
  }

  //   // Find events by location
  //   async findEventsByLocation(location: string): Promise<Event[]> {
  //     return this.eventModel.find({ location }).exec();
  //   }
}

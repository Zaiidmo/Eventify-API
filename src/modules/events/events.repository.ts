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

   // Get 3 most popular locations by event count
   async findPopularLocations(): Promise<{ location: string; count: number }[]> {
    return this.eventModel.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      { $project: { location: '$_id', count: 1, _id: 0 } },
    ]);
  }

  // Get 3 organizers with the most events
  async findTopOrganizers(): Promise<{ organizer: Types.ObjectId; count: number }[]> {
    return this.eventModel.aggregate([
      { $group: { _id: '$organizer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      { $project: { organizer: '$_id', count: 1, _id: 0 } },
    ]);
  }

  // Get the 6 most recent past events
  async findPastEvents(): Promise<Event[]> {
    const currentDate = new Date();
    return this.eventModel
      .find({ date: { $lt: currentDate } })
      .sort({ date: -1 }) // Most recent first
      .limit(6)
      .exec();
  }

  // Find Event By Organizer 
  async findByOrganizer(organizer: Types.ObjectId): Promise<Event[]>{
    return this.eventModel.find({ organizer: organizer})
  }

  //   // Find events by location
  //   async findEventsByLocation(location: string): Promise<Event[]> {
  //     return this.eventModel.find({ location }).exec();
  //   }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './events.repository';
import { Event } from './events.schema';
import { Types } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}
  // Create a new event
  async createEvent(
    createEventDto: CreateEventDto,
    bannerPath: string,
    organizer: Types.ObjectId,
  ): Promise<Event> {
    const eventData = {
      ...createEventDto,
      banner: bannerPath || null,
      organizer,
    };

    return this.eventRepository.create(eventData);
  }
  // Fetch all events
  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.findAll();
  }
  // Fetch a single event
  async getEventById(eventId: Types.ObjectId): Promise<Event | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return event;
  }
  // Update an event
  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event | null> {
    return this.eventRepository.update(id, updateEventDto);
  }
  // Delete an event
  async deleteEvent(id: string): Promise<Event | null> {
    return this.eventRepository.delete(id);
  }
  // Fetch upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    return this.eventRepository.findUpcomingEvents();
  }
  // Fetch events by location
  async getEventsByLocation(location: string): Promise<Event[]> {
    return this.eventRepository.findEventsByLocation(location);
  }
}

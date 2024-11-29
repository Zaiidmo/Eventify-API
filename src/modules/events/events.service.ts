import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventRepository } from './events.repository';
import { Event, EventDocument } from './events.schema';
import { Types } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventRepository) {}

  // Create a new event
  async createEvent(
    createEventDto: CreateEventDto,
    banenrUrl: string,
    organizer: Types.ObjectId,
  ): Promise<EventDocument> {
    const eventData = {
      ...createEventDto,
      banner: banenrUrl || null,
      organizer,
    };

    return this.eventRepository.create(eventData);
  }

  // Fetch all events
  async getAllEvents(): Promise<EventDocument[]> {
    return this.eventRepository.findAll();
  }

  // Fetch a single event
  async getEventById(eventId: Types.ObjectId): Promise<EventDocument | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return event;
  }
  // Update an event
  async updateEvent(
    eventId: Types.ObjectId,
    updateEventDto: UpdateEventDto,
    file: Express.Multer.File,
    authenticatedUser: Types.ObjectId,
  ): Promise<EventDocument> {
    //Step 1: Fetch The Event's Data
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    //Step 2: Check if the authenticated user is the organizer of the event
    if (event.organizer.toString() !== authenticatedUser.toString()) {
      throw new NotFoundException(
        `You are not authorized to update this event`,
      );
    }
    //Step 3: Update the banner if new file is provided
    const bannerPath = file ? file.path : event.banner;
    //Step 4: Update the event data
    const eventData = {
      ...updateEventDto,
      banner: bannerPath,
    };
    //Step 5: Save the updated event data
    const updatedEvent = this.eventRepository.updateEvent(eventId, eventData);
    return updatedEvent;
  }
  // // Delete an event
  async deleteEvent(
    id: Types.ObjectId,
    authenticatedUser: Types.ObjectId,
  ): Promise<any> {
    // Step 1: Fetch the event data
    const event = await this.getEventById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    // Step 2: Check if the authenticated user is the organizer of the event
    if (event.organizer.toString() !== authenticatedUser.toString()) {
      throw new UnauthorizedException(
        `You are not authorized to delete this event`,
      );
    }
    // Step 3: Delete the event
    try {
      const response = await this.eventRepository.delete(id);
      if(response.deletedCount === 0) {
        throw new Error(`Error deleting event with ID ${id}`);
      }
      return { id, message: 'Event deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting event with ID ${id}`);
    }
  }
  // Fetch upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    return this.eventRepository.findUpcomingEvents();
  }

  // Get the latest event
  async getLatestEvent(): Promise<EventDocument | null> {
    return this.eventRepository.findLatestEvent();
  }

  // Get popular locations
  async getPopularLocations() {
    return this.eventRepository.findPopularLocations();
  }

  // Get top organizers
  async getTopOrganizers() {
    return this.eventRepository.findTopOrganizers();
  }

  // Get past events
  async getPastEvents() {
    return this.eventRepository.findPastEvents();
  }
  // // Fetch events by location
  // async getEventsByLocation(location: string): Promise<Event[]> {
  //   return this.eventRepository.findEventsByLocation(location);
  // }
}

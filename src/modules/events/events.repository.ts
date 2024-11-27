import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Event, EventDocument } from "./events.schema";
import { Model } from "mongoose";


@Injectable()
export class EventRepository {
    constructor(@InjectModel(Event.name) private readonly eventModel: Model<EventDocument>){} 
    
    // Create a new event
    async createEvent(event: Event): Promise<EventDocument> {
        return this.eventModel.create(event);
    }
}
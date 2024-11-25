import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    location: string;

    @Prop({ required: true })
    capacity: number;

    @Prop()
    banner?: string;

    @Prop({ required: true, default: false })
    isPublished: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
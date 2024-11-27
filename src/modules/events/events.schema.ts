import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  // Organizer Relationship
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizer: Types.ObjectId; 
}

export const EventSchema = SchemaFactory.createForClass(Event);

import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RegistrationDocument = Registration & Document;

@Schema({ timestamps: true })
export class Registration {
    @Prop({ type: Types.ObjectId,ref:'Event', required: true })
    event: Types.ObjectId;
    
    @Prop({ type: [{type: Types.ObjectId, ref:'User'}], required: true })
    participants: Types.ObjectId[];
 
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);
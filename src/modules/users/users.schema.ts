import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;
export enum Role{
    ADMIN = 'admin',
    ORGANIZER = 'organizer',
    USER = 'user'
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required:true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;
    
    @Prop({ required: true })
    password: string;

    @Prop()
    avatar?: string;
    
    @Prop({ required: true, enum:Role, default: 'user' })
    role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
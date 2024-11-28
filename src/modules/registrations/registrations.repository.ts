import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Registration } from "./registrations.schema";


@Injectable()
export class RegistrationRepository {
    constructor(
        @InjectModel(Registration.name) private readonly registrationModel: Model<Registration>
    ) {}

    async create(registrationData: Partial<Registration>) : Promise<Registration> {
        const registration = new this.registrationModel(registrationData);
        return registration.save();
    }

    async findByUserAndEvent(userId: Types.ObjectId, eventId: Types.ObjectId): Promise<Registration> {
        return this.registrationModel.findOne({ user: userId, event: eventId });
    }
}
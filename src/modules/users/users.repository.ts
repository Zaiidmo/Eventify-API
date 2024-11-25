import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // Find a user by _id
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ _id: id }).exec();
  }


  // Update a user
  // async updateById(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
  //   return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  // }

  // // Delete a user
  // async deleteById(id: string): Promise<UserDocument | null> {
  //   return this.userModel.findByIdAndDelete(id).exec();
  // }

  // // Find a user by email
  // async findByEmail(email: string): Promise<UserDocument | null> {
  //   return this.userModel.findOne({ email }).exec();
  // }

  // // Find all users (optional, for admin purposes)
  // async findAll(): Promise<UserDocument[]> {
  //   return this.userModel.find().exec();
  // }
}

import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
// import { User } from './users.schema';
import { UserDocument } from './users.schema';
import { ObjectId } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  // Find a user by ID
  async findById(id: ObjectId): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  // // Create a new user
  // async create(userData: Partial<User>): Promise<User> {
  //   return this.userRepository.create(userData);
  // }

  // Update a user
  // async updateById(id: string, updateData: Partial<User>): Promise<User | null> {
  //   return this.userRepository.updateById(id, updateData);
  // }

  // // Delete a user
  // async deleteById(id: string): Promise<User | null> {
  //   return this.userRepository.deleteById(id);
  // }

  // // Find a user by email
  // async findByEmail(email: string): Promise<User | null> {
  //   return this.userRepository.findByEmail(email);
  // }

  // // List all users (optional, for admin purposes)
  // async findAll(): Promise<User[]> {
  //   return this.userRepository.findAll();
  // }
}

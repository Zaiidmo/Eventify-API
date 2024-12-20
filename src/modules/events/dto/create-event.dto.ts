import {
  IsDate,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateEventDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @IsNotEmpty({ message: 'Event title is required' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(1000, { message: 'Description must be less than 1000 characters' })
  description: string;

  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @IsNotEmpty({ message: 'Date is required' })
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty({ message: 'Capacity is required' })
  @IsInt()
  @IsPositive()
  capacity: number;

  @IsMongoId({ message: 'Organizer is invalid' })
  @IsNotEmpty({ message: 'Organizer is required' })
  organizer: Types.ObjectId;

  @IsOptional()
  @IsString()
  banner?: string;
}

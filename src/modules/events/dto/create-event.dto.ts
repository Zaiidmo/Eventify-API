import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  minLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @IsNotEmpty({ message: 'Event name is required' })
  name: string;

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
  date: Date;

  @IsNotEmpty({ message: 'Capacity is required' })
  @IsInt()
  @IsPositive()
  capacity: number;

  @IsString()
  @IsOptional()
  banner?: string;
}

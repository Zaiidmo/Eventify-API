import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateRegistrationDto {
  @IsMongoId()
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  event: Types.ObjectId;
}

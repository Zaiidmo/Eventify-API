import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "src/modules/users/users.schema";

export class RegisterDto {
    @IsString()
    @MinLength(4)
    @MaxLength(10)
    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password must be less than 32 characters' })
    password: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsEnum(Role)
    role: Role;
}

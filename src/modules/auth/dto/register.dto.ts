import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "src/modules/users/users.schema";

export class RegisterDto {
    @IsString()
    @MinLength(4)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsEnum(Role)
    role: Role;
}

import { Role } from "@/modules/users/users.schema";
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
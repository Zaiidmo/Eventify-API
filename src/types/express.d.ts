import { Role, UserDocument } from '@/modules/users/users.schema';  
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId; 
        email: string;
        role: Role;  
      };
    }
  }
}

import { AuthenticatedUser } from '../src/types/auth';

declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedUser;
    }
  }
}

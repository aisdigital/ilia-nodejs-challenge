export interface UserPayload {
  sub: number;
  email: string;
  fristName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

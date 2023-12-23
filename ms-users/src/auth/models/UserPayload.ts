export interface UserPayload {
  sub: number;
  email: string;
  first_name: string;
  last_name: string;
  iat?: number;
  exp?: number;
}

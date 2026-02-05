export interface UserRequest {
  first_name: string;
  last_name: string;
  password: string;
  email: string;
}

export interface UsersModel {
  id: string;
  first_name: string;
  last_name: string;
  password: string;
  email: string;
}

export interface UsersResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  access_token: string;
}

export interface AuthServiceResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

export interface UserWithBalanceResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number | null;
}

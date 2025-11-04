export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRepositoryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserRepositoryDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  updatedAt: Date;
}

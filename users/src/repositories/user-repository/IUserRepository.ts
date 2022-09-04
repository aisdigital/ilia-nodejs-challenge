import { UserEntity } from "@entities/UserEntity";

export interface IUserRepository {
  save(email: string, password: string, first_name: string, last_name: string): Promise<UserEntity>;
  findUsers(): Promise<UserEntity[]>;
  findByEmail(email: string): Promise<UserEntity>;
  findUniqueUser(id: string): Promise<UserEntity>;
  updateUser(
    id: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<UserEntity>;
  deleteUser(id: string): Promise<boolean>;
}

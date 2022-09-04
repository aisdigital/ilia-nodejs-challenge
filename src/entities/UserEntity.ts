export class UserEntity {
  id?: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  update_at?: Date;
  created_at?: Date;

  constructor(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    id: string,
    update_at: Date,
    created_at: Date
  ) {
    this.email = email;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.created_at = created_at;
    this.update_at = update_at;
    this.id = id;
  }
}

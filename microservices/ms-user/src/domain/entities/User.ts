export class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
    };
  }
}

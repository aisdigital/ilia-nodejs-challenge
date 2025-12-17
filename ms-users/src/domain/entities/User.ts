import { v4 as uuidv4 } from 'uuid';

export interface UserProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private constructor(private props: UserProps) {
    this.validate();
  }

  public static create(props: UserProps): User {
    return new User({
      ...props,
      id: props.id || this.generateId(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    });
  }

  public static restore(props: UserProps): User {
    if (!props.id || !props.createdAt) {
      throw new Error('ID and createdAt are required for restoring a user');
    }
    return new User(props);
  }

  private static generateId(): string {
    return uuidv4();
  }

  private validate(): void {
    if (!this.props.firstName?.trim()) {
      throw new Error('First name is required');
    }

    if (!this.props.lastName?.trim()) {
      throw new Error('Last name is required');
    }

    if (!this.props.email?.trim()) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(this.props.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.props.password) {
      throw new Error('Password is required');
    }

    if (this.props.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get id(): string {
    return this.props.id!;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  public updatePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  public updateProfile(firstName?: string, lastName?: string): void {
    if (firstName?.trim()) {
      this.props.firstName = firstName.trim();
    }
    if (lastName?.trim()) {
      this.props.lastName = lastName.trim();
    }
    this.props.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  public toJSONWithPassword() {
    return {
      id: this.id,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}
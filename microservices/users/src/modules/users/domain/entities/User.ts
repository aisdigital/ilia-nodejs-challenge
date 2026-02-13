export class User {
  private readonly _id: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _email: string;
  private readonly _passwordHash: string;

  private constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    passwordHash: string,
  ) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._passwordHash = passwordHash;
  }

  public static create(props: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    id?: string;
  }): User {
    if (!props.email || !props.passwordHash) {
      throw new Error('Email and password hash are required.');
    }
    return new User(
      props.id ?? crypto.randomUUID(),
      props.firstName,
      props.lastName,
      props.email,
      props.passwordHash,
    );
  }

  get id(): string {
    return this._id;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get email(): string {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
}

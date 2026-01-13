export interface UserCreatedEvent {
  eventType: "USER_CREATED";
  payload: {
    userId: string;
    email: string;
  };
}

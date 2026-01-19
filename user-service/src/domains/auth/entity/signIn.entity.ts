export type SignInEntity = {
  idToken: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
};

export type FirebaseResponse = {
  localId: string;
};

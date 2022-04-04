import passport from 'passport';
import passportJwt from 'passport-jwt';

export interface TokenData {
  _id: string;
  iat: number;
  aud: string;
  iss: string;
}

let JWT_SECRET;
if (process.env.NODE_ENV === 'test') {
  JWT_SECRET = 'testJwtSecret';
} else {
  JWT_SECRET = process.env.JWT_SECRET;
}

const jwtOpts = {
  jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

export const usePassport = (): void => {
  const jwtStrategy = new passportJwt.Strategy(
    jwtOpts,
    async (payload: { _id: string }, done: passportJwt.VerifiedCallback) => {
      return done(null, payload);
    },
  );

  passport.use(jwtStrategy);
};

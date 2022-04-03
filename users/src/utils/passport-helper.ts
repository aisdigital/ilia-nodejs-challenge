import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import passportJwt from 'passport-jwt';
import passportLocal from 'passport-local';
import UserModel, { User } from '../modules/user/models/User';
import ErrorHandler from './error';

export interface TokenData {
  _id: string;
  iat: number;
  aud: string;
  iss: string;
}

const { JWT_SECRET } = process.env;
const JWT_EXPIRATION = 4 * 60 * 60;

export const usePassport = (): void => {
  const jwtOpts = {
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
  };
  const localStrategy = new passportLocal.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (
      _req,
      email: string,
      password: string,
      done: (error: Error, user?: User, options?: passportLocal.IVerifyOptions) => void,
    ) => {
      try {
        const user = await UserModel.findOne({
          email,
        });
        if (user) {
          const passwordMatches = await user.comparePassword(password);
          if (passwordMatches) {
            return done(null, user, { message: 'Signed in successfully.' });
          }
        }
        return done(new ErrorHandler(401, 'Email and password combination is invalid.'));
      } catch (err) {
        return done(new ErrorHandler(500, err.message));
      }
    },
  );
  const jwtStrategy = new passportJwt.Strategy(
    jwtOpts,
    async (payload: { _id: string }, done: passportJwt.VerifiedCallback) => {
      const exists = await UserModel.exists({ _id: payload._id });
      if (!exists) {
        return done(new ErrorHandler(401, 'User not found'));
      } else {
        return done(null, payload);
      }
    },
  );

  passport.use(localStrategy);
  passport.use(jwtStrategy);
};
export const promisifyLocalAuthenticate = (req: Request, res: Response): Promise<User> =>
  new Promise((resolve, reject) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) return reject(err);
      if (!user) return reject(new ErrorHandler(403, info.message));
      return resolve(user);
    })(req, res);
  });

export const getToken = async (user: User): Promise<{ accessToken: string; expiresIn: number }> => {
  return {
    accessToken: jwt.sign(
      {
        _id: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRATION,
      },
    ),
    expiresIn: JWT_EXPIRATION,
  };
};

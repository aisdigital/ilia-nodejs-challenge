import { NextFunction, Request, Response } from 'express';
import RefreshToken from './models/RefreshToken';
import UserModel, { User } from '../user/models/User';
import ErrorHandler from '../../utils/error';
import { getToken, promisifyLocalAuthenticate } from '../../utils/passport-helper';
import uuid4 from 'uuid4';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await promisifyLocalAuthenticate(req, res);

    handleLogin(user, res);
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error.message));
    }
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshTokenSend = await RefreshToken.findOne({ token: req.body.refresh_token });

    if (refreshTokenSend !== null) {
      const user = await UserModel.findById(refreshTokenSend.user_id);

      handleLogin(user, res);
    } else {
      throw new ErrorHandler(
        422,
        "We couldn't complete your request, please check your refresh token.",
      );
    }
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error.message));
    }
  }
};

const handleLogin = async (user: User, res: Response) => {
  const { accessToken, expiresIn } = await getToken(user);
  const refreshToken = uuid4();

  await RefreshToken.updateMany({ user_id: user._id }, { expired: true });

  const token = new RefreshToken({
    token: refreshToken,
    user_id: user._id,
  });

  await token.save();

  const responseJson = {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: expiresIn,
  };

  return res.status(200).json(responseJson).end();
};

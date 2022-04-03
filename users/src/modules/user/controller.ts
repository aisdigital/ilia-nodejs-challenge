/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NextFunction, Request, Response } from 'express';
import ErrorHandler from '../../utils/error';
import { getToken, TokenData } from '../../utils/passport-helper';
import UserModel from './models/User';

type Req = Request & {
  user: TokenData;
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = new UserModel({
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.password,
    });

    await user.save();

    const { accessToken } = await getToken(user);

    return res
      .status(201)
      .json({ ...user.serialize(), access_token: accessToken })
      .end();
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error.message));
    }
  }
};

export const listUsers = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find({});

    return res.status(200).json(users.map((user) => user.serialize()));
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};

export const updateUser = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const { password, ...body } = req.body;
    const user = await UserModel.findByIdAndUpdate(user_id, body, { new: true });

    user.password = password;

    user.save();

    return res.status(200).json({ ...user.serialize() });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};

export const getUserById = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const user = await UserModel.findById(user_id);

    return res.status(200).json({ ...user.serialize() });
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};

export const deleteUser = async (req: Req, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    await UserModel.deleteOne({ _id: user_id });

    return res.status(200).end();
  } catch (error) {
    if (error instanceof ErrorHandler) {
      next(error);
    } else {
      next(new ErrorHandler(500, error?.response?.data));
    }
  }
};

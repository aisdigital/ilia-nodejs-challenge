import { UserInfo } from "./types";

const jwt = require("jsonwebtoken");

export const verifyToken = (req: any, res: any, next: any) => {
  const authorization = req.headers.authorization;
  const bearer = authorization && authorization.split(" ")[0];
  const token = authorization && authorization.split(" ")[1];

  if (bearer !== "Bearer" || token === undefined)
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });

  jwt.verify(token, process.env.JWT_KEY, (err: Error, user: any) => {
    console.log(err);
    if (err)
      return res
        .status(401)
        .json({ message: "Access token is missing or invalid" });

    console.log(user);

    next();
  });
};

export const isUserInfo = (info: Object): boolean => {
  const userInfo: UserInfo = {
    id: "id",
    first_name: "first_name",
    last_name: "last_name",
    password: "password",
    email: "email",
  };

  for (const key in userInfo) {
    if (!(key in info)) return false;
  }
  if (Object.keys(info).length > 5) return false;
  return true;
};

const jwt = require("jsonwebtoken");

export const verifyToken = (req: any, res: any, next: any) => {
  const authorization = req.headers.authorization;
  const bearer = authorization && authorization.split(" ")[0];
  const token = authorization && authorization.split(" ")[1];

  if (bearer !== "Bearer" || token === undefined)
    return res.status(401).json({ message: "missing bearer token" });

  jwt.verify(token, process.env.JWT_KEY, (err: Error, user: any) => {
    console.log(err);
    if (err) return res.status(401).json({ message: "wrong token" });

    console.log(user);

    next();
  });
};

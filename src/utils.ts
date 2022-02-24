const jwt = require("jsonwebtoken");

export const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const bearer = authorization && authorization.split(" ")[0];
  const token = authorization && authorization.split(" ")[1];

  if (bearer !== "Bearer" || token === undefined)
    return res.status(401).json({ message: "missing bearer token" });

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    console.log(err);
    if (err) return res.status(401).json({ message: "wrong token" });

    console.log(user);

    next();
  });
};

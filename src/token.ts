const jwt = require("jsonwebtoken");

export const sendToken = (req: any, res: any) => {
  console.log(req);
  const body = req.body;
  console.log(body);
  if (body.user_id === undefined)
    res.status(422).json({ message: "missing user id" });
  else {
    try {
      const token = jwt.sign(body.user_id, process.env.JWT_KEY);

      res
        .status(200)
        .json({ message: "token generated successfuly", token: token });
    } catch (e) {
      console.log(e);
      res.status(500);
    }
  }
};

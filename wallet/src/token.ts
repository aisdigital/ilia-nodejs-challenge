const jwt = require("jsonwebtoken");

export const sendToken = (req: any, res: any) => {
  const body = req.body;
  if (body.user_id === undefined)
    res.status(422).json({ message: "Missing user id" });
  else {
    try {
      const token = jwt.sign(body.user_id, process.env.JWT_KEY);

      res
        .status(200)
        .json({ message: "Token generated successfuly", token: token });
    } catch (e) {
      console.log(e);
      res.status(500);
    }
  }
};

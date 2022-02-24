import axios from "axios";

const BASEURL = "http://localhost:3001";

const req = {
  user_id: "LUIZFELIPE",
  amount: 500,
  type: "CREDIT",
};
axios.post(BASEURL + "/transactions", req).then(console.log);

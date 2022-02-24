import axios from "axios";

const BASEURL = "http://localhost:3001";

const req = {
  user_id: "LUIZFELIPE",
};
axios.post(BASEURL + "/jwt", req).then(console.log);

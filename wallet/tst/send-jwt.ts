import axios from "axios";

const BASEURL = "http://localhost:3001";

axios
  .get(BASEURL + "/balance", { headers: { Authorization: "Bearer teste" } })
  .then(console.log);

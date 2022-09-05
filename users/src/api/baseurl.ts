import axios from "axios";
import "dotenv/config";

export const API = axios.create({
  baseURL: "http://localhost:3001",
});

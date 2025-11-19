import axios from "axios";

const api = axios.create({
  //baseURL: "https://localhost:5091/api,"
  baseURL: "https://localhost:7119/api",
  //baseURL: "https://localhost:7284/api",
});

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5091/api", // adjust to your actual HTTPS URL
});

export default api;

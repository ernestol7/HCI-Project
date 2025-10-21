import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // base URL of your backend
});

export default api;
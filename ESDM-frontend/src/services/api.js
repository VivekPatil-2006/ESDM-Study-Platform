import axios from "axios";

const API = axios.create({
  //baseURL: "https://esdm-study-platform.onrender.com/api",
  baseURL: "https://untrailed-lura-transmittible.ngrok-free.dev/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;

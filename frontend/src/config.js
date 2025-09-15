// frontend/src/config.js
export const API = "http://localhost:5000/api";
export const getUserId = () => localStorage.getItem("userId");
export const getToken = () => localStorage.getItem("token");
export const setAuth = ({ token, userId }) => { localStorage.setItem("token", token); localStorage.setItem("userId", userId); }
export const clearAuth = () => { localStorage.removeItem("token"); localStorage.removeItem("userId"); }

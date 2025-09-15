// frontend/src/config.js
export const API = "https://college-project-y397.onrender.com/api";
export const getUserId = () => localStorage.getItem("userId");
export const getToken = () => localStorage.getItem("token");
export const setAuth = ({ token, userId }) => { localStorage.setItem("token", token); localStorage.setItem("userId", userId); }
export const clearAuth = () => { localStorage.removeItem("token"); localStorage.removeItem("userId"); }

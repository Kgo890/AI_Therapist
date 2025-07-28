import axios from "axios";


// const BASE_URL = process.env.REACT_APP_API;
const BASE_URL = "http://localhost:10000";
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) {
        console.error("No refresh token found.");
        return Promise.reject(error);
      }

      try {
       const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refresh_token,
        });

        const new_access_token = res.data.access_token;
        localStorage.setItem("access_token", new_access_token);

        originalRequest.headers.Authorization = `Bearer ${new_access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
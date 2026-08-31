import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8006/workflow",

});

axiosInstance.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("accessToken");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        // FormData가 아닌 경우에만 JSON으로 설정
        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
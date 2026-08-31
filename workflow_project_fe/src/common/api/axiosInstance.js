import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8006/workflow",
    // headers: {
    //     "Content-Type": "application/json",
    // },
});

axiosInstance.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("accessToken");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);
axiosInstance.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("accessToken");

        console.log("===== API REQUEST =====");
        console.log("URL:", config.baseURL + config.url);
        console.log("METHOD:", config.method);
        console.log("TOKEN:", token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Authorization:", config.headers.Authorization);
        } else {
            console.log("Authorization 없음");
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
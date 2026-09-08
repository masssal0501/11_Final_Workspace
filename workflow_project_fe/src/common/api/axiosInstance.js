import axios from "axios";

// 빌드 시점에 VITE_API_BASE_URL로 실제 배포 주소를 주입한다.
// (지정하지 않으면 로컬 개발 기본값 사용 - 기존 동작과 동일)
// Production 빌드는 Nginx가 "/workflow"를 같은 origin에서 프록시하므로
// 상대경로("/workflow")를 쓰는 것을 권장한다 (CORS 자체가 필요 없어짐).
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8006/workflow";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
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

export default axiosInstance;
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

// ---------------------------------------------------------------------------
// Response Interceptor - 401(인증 실패/JWT 만료) / 403(권한 부족) 처리
//
// 백엔드(SecurityConfig)는 이제 인증 실패(토큰 없음/만료/위조)와 인가 실패(권한 부족)를
// 각각 401 / 403으로 구분해서 응답한다(JwtAuthenticationEntryPoint / JwtAccessDeniedHandler).
// - 401: 로그인 자체가 무효한 상태이므로 Header.jsx/App.jsx의 로그아웃 로직과 동일하게
//        accessToken/user를 지우고 로그인 페이지로 보낸다(자동 로그아웃).
// - 403: 로그인은 유효하지만 권한이 없는 것이므로 로그아웃시키지 않고 에러 페이지로 보낸다.
//
// axios 인터셉터는 React 컴포넌트 트리 밖에서 실행되어 useNavigate 같은 Router Hook을
// 쓸 수 없으므로, App.jsx가 하는 것과 동일하게 localStorage를 직접 정리하고
// window.location으로 이동시킨다(그 결과 App.jsx가 처음부터 다시 마운트되며
// loginUser를 localStorage에서 다시 읽어 자연스럽게 비로그인 상태로 초기화된다).
//
// JWT 만료 상태에서 여러 API가 동시에 401을 받아도 로그아웃/리다이렉트가 한 번만
// 일어나도록 isRedirecting 플래그로 중복 실행을 막는다.
// ---------------------------------------------------------------------------
let isRedirecting = false;

const redirectOnce = (path) => {

    if (isRedirecting) {
        return;
    }

    if (window.location.pathname === path) {
        return;
    }

    isRedirecting = true;

    window.location.href = path;
};

axiosInstance.interceptors.response.use(

    (response) => response,

    (error) => {

        const status = error?.response?.status;

        if (status === 401) {

            // Header.jsx의 handleLogout / App.jsx의 handleLogout과 동일하게
            // accessToken, user 두 키만 정리한다(존재하지 않는 refreshToken 등은 다루지 않음).
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            redirectOnce("/login");

        } else if (status === 403) {

            // 인증은 유효하지만 권한이 없는 경우 - 로그아웃시키지 않고 에러 페이지로 이동
            redirectOnce("/error");
        }

        return Promise.reject(error);
    }
);

// ---------------------------------------------------------------------------
// BUG-XXX: "JWT가 만료됐는데도 기존 화면에 계속 남아있는" 문제 보강
//
// 위 response 인터셉터는 실제로 API 요청이 발생해서 401을 받아야만 동작한다.
// 사용자가 만료 시점 이후 아무 조작도 하지 않고 화면만 보고 있는 경우(새 요청이
// 없는 경우) 그 순간에는 자동 로그아웃이 트리거되지 않는다. accessToken은
// 서버 서명 JWT이므로 payload의 exp(만료 시각) 클레임을 클라이언트에서 직접
// 디코딩해서(새 라이브러리 추가 없이, JWT는 signature 없이 payload만 base64url
// 디코딩 가능) 주기적으로 만료 여부를 확인하고, 만료됐다면 다음 API 요청을
// 기다리지 않고 즉시 위와 동일한 방식으로 로그아웃 처리한다.
// ---------------------------------------------------------------------------
const decodeJwtExpiry = (token) => {

    try {

        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const padded =
            base64 + "===".slice((base64.length + 3) % 4);

        const json = JSON.parse(atob(padded));

        // JWT의 exp는 "초" 단위(epoch seconds)
        return typeof json.exp === "number"
            ? json.exp * 1000
            : null;

    } catch (e) {

        return null;
    }
};

const checkTokenExpiryAndLogout = () => {

    const token = localStorage.getItem("accessToken");

    if (!token) {
        return;
    }

    const expiryMs = decodeJwtExpiry(token);

    if (expiryMs !== null && Date.now() >= expiryMs) {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        redirectOnce("/login");
    }
};

// 15초마다 만료 여부 확인 (짧은 폴링 간격이지만 로컬 디코딩만 하므로 네트워크
// 요청은 발생하지 않는다 - 서버 부하 없음)
setInterval(checkTokenExpiryAndLogout, 15000);

export default axiosInstance;
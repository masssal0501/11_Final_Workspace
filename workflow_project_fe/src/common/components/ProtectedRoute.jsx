import { Navigate } from "react-router-dom";

function ProtectedRoute({
    children,
    allowedRoles
}) {

    const token =
        localStorage.getItem("accessToken");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );


    // 로그인하지 않은 경우
    if (!token || !user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // 권한 확인
    if (
        allowedRoles &&
        !allowedRoles.includes(user.authCode)
    ) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    return children;
}

export default ProtectedRoute;
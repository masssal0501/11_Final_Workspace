import { useState } from "react";
import "./App.css";
import "./common/styles/common.css";

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";

import LoginForm from "./employee/components/LoginForm";
import FindIDForm from "./employee/components/FindIDForm";
import FindPWForm from "./employee/components/FindPWForm";
import ChangePWForm from "./employee/components/ChangePWForm";

import EmployeeEnrollFormComponent
    from "./employee/components/EmployeeEnrollFormComponent";

import MyPageForm from "./employee/components/MyPageForm";
import UpdateMyPageForm from "./employee/components/UpdateMyPageForm";
import EmployeeList from "./employee/components/EmployeeList";
import EmployeeEdit from "./employee/components/EmployeeEdit";

import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";


function App() {

    const [loginUser, setLoginUser] = useState(() => {

        const savedUser =
            localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });


    /*
     * 로그인 성공
     */
    const handleLogin = (user) => {

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        setLoginUser(user);
    };


    /*
     * 로그아웃
     */
    const handleLogout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setLoginUser(null);
    };


    /*
     * ========================================
     * 로그인하지 않은 상태
     * ========================================
     */
    if (!loginUser) {

        return (
            <div className="content">

                <Routes>

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/login"
                        element={
                            <LoginForm
                                onLogin={handleLogin}
                            />
                        }
                    />

                    <Route
                        path="/login/findID"
                        element={<FindIDForm />}
                    />

                    <Route
                        path="/login/findPW"
                        element={<FindPWForm />}
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/login"
                                replace
                            />
                        }
                    />

                </Routes>

            </div>
        );
    }


    /*
     * ========================================
     * 비밀번호 변경이 필요한 사용자
     * ========================================
     */
    if (
        loginUser.pwChgRequired === true ||
        loginUser.pwChgRequired === "true"
    ) {

        return (
            <div className="content">

                <Header
                    loginUser={loginUser}
                    onLogout={handleLogout}
                />

                <Routes>

                    <Route
                        path="/changePW"
                        element={
                            <ChangePWForm
                                loginUser={loginUser}
                                onLogin={handleLogin}
                            />
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/changePW"
                                replace
                            />
                        }
                    />

                </Routes>

                <Footer />

            </div>
        );
    }


    /*
     * ========================================
     * 정상 로그인 사용자
     * ========================================
     */

    return (
        <div>

            <Header
                loginUser={loginUser}
                onLogout={handleLogout}
            />

            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <div>대시보드</div>
                    }
                />

                {/* 마이페이지 */}

                <Route
                    path="/myPage"
                    element={<MyPageForm />}
                />

                <Route
                    path="/myPage/update"
                    element={<UpdateMyPageForm />}
                />

                {/* 비밀번호 변경 */}

                <Route
                    path="/changePW"
                    element={<ChangePWForm />}
                />

                {/* 직원 */}

                <Route
                    path="/employee/enrollForm"
                    element={
                        <EmployeeEnrollFormComponent />
                    }
                />

                <Route
                    path="/employee/list"
                    element={<EmployeeList />}
                />

                <Route
                    path="/employee/edit"
                    element={<EmployeeEdit />}
                />

                {/* 관리자 */}

                {loginUser.authCode === "ADMIN" && (

                    <Route
                        path="/admin"
                        element={
                            <div>
                                관리자 페이지
                            </div>
                        }
                    />

                )}

                {/* 부서장 */}

                {loginUser.authCode === "MANAGER" && (

                    <Route
                        path="/manager"
                        element={
                            <div>
                                부서장 페이지
                            </div>
                        }
                    />

                )}

                {/* 사원 */}

                {loginUser.authCode === "STAFF" && (

                    <Route
                        path="/employee"
                        element={
                            <div>
                                사원 페이지
                            </div>
                        }
                    />

                )}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

            <Footer />

        </div>
    );
}

export default App;
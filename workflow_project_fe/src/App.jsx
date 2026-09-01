import { useState } from "react";
import "./App.css";
import "./common/styles/common.css";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";

import NoticeListPage from './pages/notice/NoticeListPage';
import NoticeDetailPage from './pages/notice/NoticeDetailPage';
import NoticeUpdatePage from './pages/notice/NoticeUpdatePage';
import NoticeWritePage from './pages/notice/NoticeWritePage';
import NoticeAdminListPage from './pages/notice/NoticeAdminListPage';

import AmountPage from './pages/amount/AmountPage';
import AdminAmountPage from './pages/amount/AdminAmountPage';
import AmountForm from './amount/components/AmountForm';
import AmountDetail from './amount/components/AmountDetail';
import StatisticsPage from './pages/amount/StatisticsPage';

import HubListComponent from './placeinfo/components/HubListComponent';
import HubEnrollFormComponent from './placeinfo/components/HubEnrollFormComponent';
import HubDetailComponent from './placeinfo/components/HubDetailComponent';
import HubUpdateFormComponent from './placeinfo/components/HubUpdateFormComponent';
import AIComponent from './placeinfo/components/AIComponent';

import PlaceList from './place/components/PlaceList';
import PlaceForm from './place/components/PlaceForm';
import PlaceDetail from './place/components/PlaceDetail';
import PlaceEdit from './place/components/PlaceEdit';

import TaskListComponent from './taskboard/components/TaskListComponent';
import TaskDetailComponent from './taskboard/components/TaskDetailComponent';

import WorkcationListComponent from './workcation/components/WorkcationListComponent';
import WorkcationDetailComponent from './workcation/components/WorkcationDetailComponent';
import WorkcationEnrollFormComponent from './workcation/components/WorkcationEnrollFormComponent';

import LoginForm from "./employee/components/LoginForm";
import FindIDForm from "./employee/components/FindIDForm";
import FindPWForm from "./employee/components/FindPWForm";
import ChangePWForm from "./employee/components/ChangePWForm";
import EmployeeEnrollFormComponent
    from "./employee/components/EmployeeEnrollFormComponent";
import MyPageForm from "./employee/components/MyPageForm";
import UpdateMyPageForm from "./employee/components/UpdateMyPageForm";
import EmployeeList from "./employee/components/EmployeeList";
import EmployeeDetail from "./employee/components/EmployeeDetail";
import EmployeeEdit from "./employee/components/EmployeeEdit";

import ApprovalReject from "./workcation/components/approval/components/ApprovalReject";

import ErrorPage from "./common/components/ErrorPage";

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

                {/* 📌 /cost/list 요청을 사원용 정산 페이지로 연결 */}
                <Route path="/cost/list" element={<AmountPage workcationNo={1} />} />

                {/* 📌 비용 신청 페이지 경로 추가 */}
                <Route path="/cost/apply/:amountNo" element={<AmountForm workcationNo={1} />} />

                <Route path="/cost/apply" element={<AmountForm />} />

                {/* 📌 비용 정산 상세 페이지 라우트 추가 */}
                <Route path="/cost/detail/:amountNo" element={<AmountDetail />} />

                {/* 공지사항 */}
                <Route path="/notice" element={<NoticeListPage />} />
                <Route path="/notice/:noticeNo" element={<NoticeDetailPage />} />

                {/* placeInfo */}
                <Route path="/placeInfo/list" element={ <HubListComponent /> }></Route>
                <Route path="/placeInfo/enrollForm" element={ <HubEnrollFormComponent /> }></Route>
                <Route path="/placeInfo/detail/:hubNo" element={ <HubDetailComponent /> }></Route>
                <Route path="/placeInfo/updateForm/:hubNo" element={ <HubUpdateFormComponent />}></Route>
                <Route path="/placeInfo/ai" element={ <AIComponent/> }></Route>

                {/* place */}
                <Route path="/workflow/place/list" element={ <PlaceList /> } />
                <Route path="/workflow/place/Form" element={ <PlaceForm /> } />
                <Route path="/workflow/place/detail/:hubNo" element={ <PlaceDetail /> } />
                <Route path="/workflow/place/edit/:hubNo" element={ <PlaceEdit /> } />
                <Route path="/placeInfo/ai" element={ <AIComponent/> }></Route>

                {/* 업무 게시판 라우트 */}
                <Route path="/task/list" element={<TaskListComponent />} />
                <Route path="/task/detail/:taskNo" element={<TaskDetailComponent />} />

                {/* 워케이션 라우트 */}
                <Route path="/workcation/list" element={<WorkcationListComponent />} />
                <Route path="/workcation/detail/:workcationNo" element={<WorkcationDetailComponent />} />
                <Route path="/workcation/enrollform" element={<WorkcationEnrollFormComponent />} />

                {/* 대시보드 */}
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="/dashboard" element={<div>대시보드</div>}/>

                {/* 마이페이지 */}
                <Route path="/myPage" element={<MyPageForm />}/>
                <Route path="/myPage/update" element={<UpdateMyPageForm />} />

                {/* 비밀번호 변경 */}
                <Route path="/changePW" element={<ChangePWForm />} />

                {/* 관리자 */}
                {loginUser.authCode === "ADMIN" && (
                    <>
                        {/* 직원 관리 */}
                        <Route path="/employee/enrollForm" element={ <EmployeeEnrollFormComponent /> }/>
                        <Route path="/employee/list" element={<EmployeeList />} />
                        <Route path='/employee/detail/:empNo' element={<EmployeeDetail />} />
                        <Route path="/employee/edit/:empNo" element={<EmployeeEdit />} />

                        {/* 관리자용 정산 페이지 */}
                        <Route path="/admin/cost/list" element={<AdminAmountPage workcationNo={1} />} />

                        {/* 공지사항 */}
                        {/* <Route path="/admin/notice" element={<NoticeAdminListPage />} /> */}
                        <Route path="/notice/insert" element={<NoticeWritePage />} />
                        <Route path="/notice/update/:noticeNo" element={<NoticeUpdatePage />} />

                        {/* 📌 통계 페이지 라우트 추가 */}
                        <Route path="/admin/statistics" element={<StatisticsPage />} />

                        {/* 승인 페이지 */}
                        <Route path="/approval/reject/:workcationNo" element={<ApprovalReject />}/>
                    </>
                )}

                {/* 부서장 */}

                {loginUser.authCode === "MANAGER" && (

                    <Route path="/manager" element={ <div> 부서장 페이지 </div>}/>

                )}

                {/* 사원 */}

                {loginUser.authCode === "STAFF" && (

                    <Route path="/staff" element={ <div> 사원 페이지 </div> } />

                )}

                {/* 그 외 페이지 접속 시 */}
                <Route path="*" element={ <Navigate to="/error" replace />}/>
                <Route path="/error" element={ <ErrorPage /> }/>

            </Routes>

            <Footer />

        </div>
    );
}

export default App;

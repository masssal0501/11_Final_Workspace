import { useState } from "react";
import "./App.css";
import "./common/styles/common.css";
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";

import NoticeListPage from "./pages/notice/NoticeListPage";
import NoticeDetailPage from "./pages/notice/NoticeDetailPage";
import NoticeUpdatePage from "./pages/notice/NoticeUpdatePage";
import NoticeWritePage from "./pages/notice/NoticeWritePage";
// import NoticeAdminListPage from './pages/notice/NoticeAdminListPage';

import AmountPage from "./pages/amount/AmountPage";
import AdminAmountPage from "./pages/amount/AdminAmountPage";
import AmountForm from "./amount/components/AmountForm";
import AmountDetail from "./amount/components/AmountDetail";
import StatisticsPage from "./pages/amount/StatisticsPage";

import HubListComponent from "./hub/components/HubListComponent";
import HubEnrollFormComponent from "./hub/components/HubEnrollFormComponent";
import HubDetailComponent from "./hub/components/HubDetailComponent";
import HubUpdateFormComponent from "./hub/components/HubUpdateFormComponent";
import AIComponent from "./hub/components/AIComponent";

import PlaceList from "./place/components/PlaceList";
import PlaceForm from "./place/components/PlaceForm";
import PlaceDetail from "./place/components/PlaceDetail";
import PlaceEdit from "./place/components/PlaceEdit";

import TaskListComponent from "./taskboard/components/TaskListComponent";
import TaskDetailComponent from "./taskboard/components/TaskDetailComponent";

import WorkcationListComponent from "./workcation/components/WorkcationListComponent";
import WorkcationDetailComponent from "./workcation/components/WorkcationDetailComponent";
import WorkcationEnrollFormComponent from "./workcation/components/WorkcationEnrollFormComponent";
import MyWorkcationListComponent from "./workcation/components/MyWorkcationListComponent";
import MyWorkcationDetailFormComponent from "./workcation/components/MyWorkcationDetailFormComponent";

import LoginForm from "./employee/components/LoginForm";
import FindIDForm from "./employee/components/FindIDForm";
import FindPWForm from "./employee/components/FindPWForm";
import ChangePWForm from "./employee/components/ChangePWForm";
import EmployeeEnrollFormComponent from "./employee/components/EmployeeEnrollFormComponent";
import MyPageForm from "./employee/components/MyPageForm";
import UpdateMyPageForm from "./employee/components/UpdateMyPageForm";
import EmployeeList from "./employee/components/EmployeeList";
import EmployeeDetail from "./employee/components/EmployeeDetail";
import EmployeeEdit from "./employee/components/EmployeeEdit";

import ApprovalReject from "./workcation/components/approval/components/ApprovalReject";
import ApprovalHistoryList from "./workcation/components/approval/components/ApprovalHistoryList";
import ApprovalHistoryDetail from "./workcation/components/approval/components/ApprovalHistoryDetail";
import ApprovalQueueList from "./workcation/components/approval/components/ApprovalQueueList";
import ApprovalQueueDetail from "./workcation/components/approval/components/ApprovalQueueDetail";

import ReservationListComponent from "./reservation/components/ReservationListComponent";
import ReservationEnrollComponent from "./reservation/components/ReservationEnrollComponent";
import ReservationDetailComponent from "./reservation/components/ReservationDetailComponent";
import ReservationUpdateComponent from "./reservation/components/ReservationUpdateComponent";
import ReservationScheduleComponent from "./reservation/components/ReservationScheduleComponent";

import AdminComponent from "./dashboard/components/AdminComponent";
import ManagerComponent from "./dashboard/components/ManagerComponent";
import StaffComponent from "./dashboard/components/StaffComponent";

import { useKakaoLoader } from "react-kakao-maps-sdk";
import { Routes, Route, Navigate } from "react-router-dom";

const KAKAO_MAP_OPTIONS = {
    appkey: "a00510cb26a4e33be1647f26b12df5c9",
    libraries: ["services"]
};

function App() {

    useKakaoLoader(KAKAO_MAP_OPTIONS);

    const [loginUser, setLoginUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogin = (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        setLoginUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setLoginUser(null);
    };

    if (!loginUser) {
        return (
            <div className="content">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
                    <Route path="/login/findID" element={<FindIDForm />} />
                    <Route path="/login/findPW" element={<FindPWForm />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    if (loginUser.pwChgRequired === true || loginUser.pwChgRequired === "true") {
        return (
            <div className="content">
                <Header loginUser={loginUser} onLogout={handleLogout} />
                <Routes>
                    <Route path="/changePW" element={<ChangePWForm loginUser={loginUser} onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/changePW" replace />} />
                </Routes>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header loginUser={loginUser} onLogout={handleLogout} />

            <Routes>

                {/* 비용 정산 */}
                <Route path="/cost/list" element={<AmountPage workcationNo={1} />} />
                <Route path="/cost/apply/:amountNo" element={<AmountForm workcationNo={1} />} />
                <Route path="/cost/apply" element={<AmountForm />} />
                <Route path="/cost/detail/:amountNo" element={<AmountDetail />} />

                {/* 공지사항 */}
                <Route path="/notice" element={<NoticeListPage />} />
                <Route path="/notice/:noticeNo" element={<NoticeDetailPage />} />

                {/* 거점 */}
                <Route path="/hub/list" element={<HubListComponent loginUser={loginUser} />} />
                <Route path="/hub/enrollForm" element={<HubEnrollFormComponent loginUser={loginUser} />} />
                <Route path="/hub/detail/:hubNo" element={<HubDetailComponent loginUser={loginUser} />} />
                <Route path="/hub/updateForm/:hubNo" element={<HubUpdateFormComponent loginUser={loginUser} />} />
                <Route path="/hub/ai" element={<AIComponent />} />

                {/* 장소 */}
                <Route path="/place/list" element={<PlaceList />} />
                <Route path="/place/Form" element={<PlaceForm />} />
                <Route path="/place/detail/:hubNo" element={<PlaceDetail />} />
                <Route path="/place/edit/:hubNo" element={<PlaceEdit />} />

                {/* 업무 관리 */}
                <Route path="/task/list" element={<TaskListComponent />} />
                <Route path="/task/detail/:workcationNo" element={<TaskDetailComponent />} />

                {/* 워케이션 */}
                <Route path="/workcation/list" element={<WorkcationListComponent loginUser={loginUser} />} />
                <Route path="/workcation/detail/:workcationNo" element={<WorkcationDetailComponent />} />

                {/* 내 워케이션 */}
                <Route path="/workcation/mylist" element={<MyWorkcationListComponent />} />
                <Route path="/workcation/mylist/:workcationNo" element={<MyWorkcationDetailFormComponent />} />

                {/* 관리자 제외 워케이션 신청 */}
                {loginUser.authCode !== "ADMIN" && (
                    <Route path="/workcation/enrollform" element={<WorkcationEnrollFormComponent />} />
                )}

                {/* 대시보드 */}
                <Route path="/" element={loginUser.authCode === "ADMIN" ? <AdminComponent /> : loginUser.authCode === "MANAGER" ? <ManagerComponent loginUser={loginUser} /> : <StaffComponent loginUser={loginUser} />} />

                {/* 마이페이지 */}
                <Route path="/myPage" element={<MyPageForm />} />
                <Route path="/myPage/update" element={<UpdateMyPageForm />} />

                {/* 비밀번호 변경 */}
                <Route path="/changePW" element={<ChangePWForm />} />

                {/* 예약 */}
                <Route path="/reservations" element={<ReservationListComponent />} />
                <Route path="/reservations/enroll" element={<ReservationEnrollComponent />} />
                <Route path="/reservations/:rsvNo" element={<ReservationDetailComponent />} />
                <Route path="/reservations/:rsvNo/update" element={<ReservationUpdateComponent />} />
                <Route path="/reservations/schedules" element={<ReservationScheduleComponent />} />

                {/* 관리자 */}
                {loginUser.authCode === "ADMIN" && (
                    <>
                        <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />} />
                        <Route path="/employee/list" element={<EmployeeList />} />
                        <Route path="/employee/detail/:empNo" element={<EmployeeDetail />} />
                        <Route path="/employee/edit/:empNo" element={<EmployeeEdit />} />

                        <Route path="/admin/cost/list" element={<AdminAmountPage workcationNo={1} />} />

                        <Route path="/notice/insert" element={<NoticeWritePage />} />
                        <Route path="/notice/update/:noticeNo" element={<NoticeUpdatePage />} />

                        <Route path="/admin/statistics" element={<StatisticsPage />} />

                        <Route path="/approval/reject/:workcationNo" element={<ApprovalReject />} />
                        <Route path="/approval/history" element={<ApprovalHistoryList />} />
                        <Route path="/approval/history/detail/:workcationNo" element={<ApprovalHistoryDetail />} />
                        <Route path="/approval/queue/list" element={<ApprovalQueueList />} />
                        <Route path="/approval/queue/detail/:workcationNo" element={<ApprovalQueueDetail />} />
                    </>
                )}

                {/* 부서장 */}
                {loginUser.authCode === "MANAGER" && (
                    <Route path="/manager" element={<div>부서장 페이지</div>} />
                )}

                {/* 사원 */}
                {loginUser.authCode === "STAFF" && (
                    <Route path="/staff" element={<div>사원 페이지</div>} />
                )}

                <Route path="/login" element={<Navigate to="/" replace />} />

            </Routes>

            <Footer />
        </div>
    );
}

export default App;
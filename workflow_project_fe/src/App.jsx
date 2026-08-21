import { useState } from 'react'
import './App.css'


import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
//import LoginForm from './common/components/LoginForm';
//import FindIDForm from './common/components/FindIDForm';
//import FindPWForm from './common/components/FindPWForm';
import AmountPage from './pages/AmountPage';
import AdminAmountPage from './pages/AdminAmountPage';
import AmountForm from './common/components/AmountForm';
import AmountDetail from './common/components/AmountDetail';
import StatisticsPage from './pages/StatisticsPage';


import { Routes, Route, Navigate } from "react-router-dom";

function App() {

  return (
    
      <Routes>
      {/* 📌 /cost/list 요청을 사원용 정산 페이지로 연결 */}
      <Route path="/cost/list" element={<AmountPage workcationNo={1} />} />
      

      {/* 📌 비용 신청 페이지 경로 추가 */}
      <Route path="/cost/apply/:amountNo" element={<AmountForm workcationNo={1} />} />

      <Route path="/cost/apply" element={<AmountForm />} />

      {/* 📌 비용 정산 상세 페이지 라우트 추가 */}
        <Route path="/cost/detail/:amountNo" element={<AmountDetail />} />
      
      {/* 관리자용 정산 페이지 */}
      <Route path="/admin/cost/list" element={<AdminAmountPage workcationNo={1} />} />

      {/* 📌 통계 페이지 라우트 추가 */}
        <Route path="/admin/statistics" element={<StatisticsPage />} />
      
    </Routes>
    
  );

  /*const [loginUser, setLoginUser] = useState(sessionStorage.getItem("loginUser"));

  if(loginUser == null) {
  
    return(
      <div>

        <Header />

        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginForm />}></Route>
            <Route path="/login/findID" element={<FindIDForm />}></Route>
            <Route path="/login/findPW" element={<FindPWForm />}></Route>
          </Routes>
        </div>

        <Footer />
      </div>
    );
  } else {

    return(

      <div>
        <Header />

          <div className="content">
            로그인 성공
          </div>

        <Footer />
      </div>
    ); */

  }

  

export default App

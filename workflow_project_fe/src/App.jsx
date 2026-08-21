import { useState } from 'react'
import './App.css'
import './common/styles/common.css'

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
import LoginForm from './employee/components/LoginForm';
import FindIDForm from './employee/components/FindIDForm';
import FindPWForm from './employee/components/FindPWForm';
import EmployeeEnrollFormComponent from './employee/components/EmployeeEnrollFormComponent';

import ChangePWForm from './employee/components/ChangePWForm';

import { Routes, Route, Navigate } from "react-router-dom";



function App() {

  const [loginUser, setLoginUser] = useState(sessionStorage.getItem("loginUser"));

  /* 컴포넌트 확인용, 추후 삭제 */
  return( 
    <div>
      <Header/>
      <Routes>
        <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
          <Route path="/login/findID" element={<FindIDForm />}></Route>
          <Route path="/login/findPW" element={<FindPWForm />}></Route>
          <Route path="/changePW" element={<ChangePWForm />}></Route>
      </Routes>
      <Footer/>
    </div>
  )


  if(loginUser == null) { // 권한으로 분기점 샏성해야함 (추후 "==" 으로 수정)
  
    return(
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<LoginForm />}></Route>
          <Route path="/login/findID" element={<FindIDForm />}></Route>
          <Route path="/login/findPW" element={<FindPWForm />}></Route>
        </Routes>
      </div>
    );
  } else { // 관리자일 경우

    return(

      <div>
        <Header />

        <Routes>
          <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />}></Route>
          <Route path="/changePW" element={<ChangePWForm />}></Route>
        </Routes>

        <Footer />
      </div>
    );
  }
}

export default App

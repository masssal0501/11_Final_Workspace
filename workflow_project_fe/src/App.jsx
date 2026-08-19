import { useState } from 'react'
import './App.css'

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
import LoginForm from './login/component/LoginForm';
import FindIDForm from './login/component/FindIDForm';
import FindPWForm from './login/component/FindPWForm';

import HubListComponent from './hub/components/HubListComponent';
import HubEnrollFormComponent from './hub/components/HubEnrollFormComponent';
import HubDetailComponent from './hub/components/HubDetailComponent';
import HubUpdateFormComponent from './hub/components/HubUpdateFormComponent';

import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeEnrollFormComponent from './employee/components/EmployeeEnrollFormComponent';

function App() {

  const [loginUser, setLoginUser] = useState(sessionStorage.getItem("loginUser"));

  if(loginUser != null) { // 권한으로 분기점 샏성해야함 (추후 "==" 으로 수정)
  
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

          <div className="content">
            로그인 성공
            <Routes>
              <Route path="/hub/list" element={ <HubListComponent /> }></Route>
              <Route path="/hub/enrollForm" element={ <HubEnrollFormComponent /> }></Route>
              <Route path="/hub/detail/:hubno" element={ <HubDetailComponent /> }></Route>
              <Route path="hub/updateForm" element={ <HubUpdateFormComponent />}></Route>
            </Routes>
          </div>
        <Routes>
          <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />}></Route>
        </Routes>

        <Footer />
      </div>
    );
  }
}

export default App

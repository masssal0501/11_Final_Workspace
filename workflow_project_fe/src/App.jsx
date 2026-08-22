import { useState } from 'react'
import './App.css'
import './common/styles/common.css'

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
import LoginForm from './login/component/LoginForm';
import FindIDForm from './login/component/FindIDForm';
import FindPWForm from './login/component/FindPWForm';

import HubListComponent from './placeinfo/components/HubListComponent';
import HubEnrollFormComponent from './placeinfo/components/HubEnrollFormComponent';
import HubDetailComponent from './placeinfo/components/HubDetailComponent';
import HubUpdateFormComponent from './placeinfo/components/HubUpdateFormComponent';
import AIComponent from './placeinfo/components/AIComponent';

import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeEnrollFormComponent from './employee/components/EmployeeEnrollFormComponent';

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

          <div className="content">
            로그인 성공
            <Routes>
              <Route path="/placeInfo/list" element={ <HubListComponent /> }></Route>
              <Route path="/placeInfo/enrollForm" element={ <HubEnrollFormComponent /> }></Route>
              <Route path="/placeInfo/detail/:hubno" element={ <HubDetailComponent /> }></Route>
              <Route path="/placeInfo/updateForm" element={ <HubUpdateFormComponent />}></Route>
              <Route path="/placeInfo/ai" element={ <AIComponent/> }></Route>
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

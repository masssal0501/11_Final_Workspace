import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react'
import './App.css'
import './common/styles/common.css'

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
import LoginForm from './login/component/LoginForm';
import FindIDForm from './login/component/FindIDForm';
import FindPWForm from './login/component/FindPWForm';

import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeEnrollFormComponent from './employee/components/EmployeeEnrollFormComponent';

import Header from './common/components/Header';
import Footer from './common/components/Footer';

import TaskListComponent from './taskboard/components/TaskListComponent'
import TaskDetailComponent from './taskboard/components/TaskDetailComponent';

import WorkcationListComponent from './workcation/components/WorkcationListComponent';
import WorkcationDetailComponent from './workcation/components/WorkcationDetailComponent';
import WorkcationEnrollFormComponent from './workcation/components/WorkcationEnrollFormComponent';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {


  return (
    <div>
      <Header />

      <div className="content">
        <Routes>
          {/*  테스트용, 목록으로 자동이동 */}
          <Route path="/" element={<Navigate to ="/task/list" replace />}/>

          <Route path="/task/list" element={ <TaskListComponent />}/>
          <Route path="/task/detail/:taskNo" element={<TaskDetailComponent />}/>

          <Route path="/workcation/list" element={<WorkcationListComponent/>}/>
          <Route path="/workcation/detail/:workcationNo" element={<WorkcationDetailComponent/>}/>
          <Route path="/workcation/enrollform" element={<WorkcationEnrollFormComponent/>}/>
        </Routes>

      </div>

      <Footer />

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

        <Routes>
          <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />}></Route>
        </Routes>

        <Footer />
      </div>
    );
  }
}

export default App

import { useState } from 'react'
import './App.css'

import Header from "./common/components/Header";
import Footer from "./common/components/Footer";
import LoginForm from './common/components/LoginForm';
import FindIDForm from './common/components/FindIDForm';
import FindPWForm from './common/components/FindPWForm';

import HubListComponent from './hub/components/HubListComponent';
import HubEnrollFormComponent from './hub/components/HubEnrollFormComponent';
import HubDetailComponent from './hub/components/HubDetailComponent';
import HubUpdateFormComponent from './hub/components/HubUpdateFormComponent';

import { Routes, Route, Navigate } from "react-router-dom";

function App() {

  const [loginUser, setLoginUser] = useState(sessionStorage.getItem("loginUser"));

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
            <Routes>
              <Route path="/hub/list" element={ <HubListComponent /> }></Route>
              <Route path="/hub/enrollForm" element={ <HubEnrollFormComponent /> }></Route>
              <Route path="/hub/detail/:hubno" element={ <HubDetailComponent /> }></Route>
              <Route path="hub/updateForm" element={ <HubUpdateFormComponent />}></Route>
            </Routes>
          </div>

        <Footer />
      </div>
    );
  }
}

export default App

import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import './common/styles/common.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Header from './common/components/Header';
import Footer from './common/components/Footer';

import EmployeeEnrollFormComponent from './employee/components/EmployeeEnrollFormComponent';
import TaskListComponent from './taskboard/components/TaskListComponent';
import TaskDetailComponent from './taskboard/components/TaskDetailComponent';

import WorkcationListComponent from './workcation/components/WorkcationListComponent';
import WorkcationDetailComponent from './workcation/components/WorkcationDetailComponent';
import WorkcationEnrollFormComponent from './workcation/components/WorkcationEnrollFormComponent';

function App() {
  return (
    <div>
      <Header />

      <div className="content">
        <Routes>
          {/* 업무 게시판 라우트 */}
          <Route path="/task/list" element={<TaskListComponent />} />
          <Route path="/task/detail/:taskNo" element={<TaskDetailComponent />} />

          {/* 워케이션 라우트 */}
          <Route path="/workcation/list" element={<WorkcationListComponent />} />
          <Route path="/workcation/detail/:workcationNo" element={<WorkcationDetailComponent />} />
          <Route path="/workcation/enrollform" element={<WorkcationEnrollFormComponent />} />

          {/* 사원 등록 라우트 */}
          <Route path="/employee/enrollForm" element={<EmployeeEnrollFormComponent />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
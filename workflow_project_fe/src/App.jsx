import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css'

import Header from './common/components/Header';
import Footer from './common/components/Footer';

import TaskListComponent from './taskboard/components/TaskListComponent'
import TaskDetailComponent from './taskboard/components/TaskDetailComponent';

import WorkcationListComponent from './workcation/components/WorkcationListComponent';

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
        </Routes>

      </div>

      <Footer />
    </div>
  )
}

export default App

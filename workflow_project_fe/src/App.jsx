import './App.css'

import Header from './common/components/Header';
import Footer from './common/components/Footer';

import TaskListComponent from './taskboard/components/TaskListComponent'
import TaskDetailComponent from './taskboard/components/TaskDetailComponent';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Route, Routes } from 'react-router-dom';

function App() {


  return (
    <div>
      <Header />

      <div className="content">
        <Routes>
          <Route path="/task/list" element={ <TaskListComponent />}/>
          <Route path="/task/detail/:taskNo" element={<TaskDetailComponent />}/>
         
        </Routes>

      </div>

      <Footer />
    </div>
  )
}

export default App

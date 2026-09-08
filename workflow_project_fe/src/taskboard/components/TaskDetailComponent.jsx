import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getWorkcationTasks } from "../api/Task";
import TaskStatusBadge from "./TaskStatusBadge";

import "../styles/TaskDetail.css";

function TaskDetailComponent() {
    const { workcationNo } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);

    useEffect(() => {
        selectWorkcationTasks();
    }, [workcationNo]);

    // 조회
    const selectWorkcationTasks = async () => {
        try {
            const response = await getWorkcationTasks(workcationNo);
            setData(response);
        } catch (error) {
            console.error("워케이션 업무 조회 실패", error);
        }
    };

    if (!data) {
        return (
            <div className="content-area">
                <h2 align="center">업무 상세 조회</h2>
            </div>
        );
    }

    return (
        <div className="content-area">
            <h2 align="center">업무 상세 조회</h2>

            <div className="task-summary">
                <div>워케이션 제목 : {data.workcationTitle}</div>
                <div>작성자 : {data.writer}</div>
                <div>업무 수 : {data.taskCount}개</div>
                <div>전체 진행도 : {data.overallProgress}%</div>
            </div>

            <table className="list-area">
                <thead>
                    <tr>
                        <th>번호</th>
                        <th>업무 제목</th>
                        <th>진행도</th>
                        <th>업무 시작일</th>
                    </tr>
                </thead>

                <tbody>
                    {data.taskList?.map((task) => (
                        <tr key={task.taskNo}>
                            <td>{task.taskNo}</td>

                            <td>{task.taskTitle}</td>

                            <td>
                                 <TaskStatusBadge progress={task.progress} />
                            </td>

                            <td>
                                {task.tasktimeAt
                                    ? task.tasktimeAt.substring(0, 10)
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {(!data.taskList || data.taskList.length === 0) && (
                <div className="empty-message">
                    등록된 업무가 없습니다.
                </div>
            )}

            <div className="btn-set">
                <button
                    type="button"
                    onClick={() => navigate("/task/list")}
                >
                    목록
                </button>
            </div>
        </div>
    );
}

export default TaskDetailComponent;
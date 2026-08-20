import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import TaskStatusBadge, {getProgressByStatus} from './TaskStatusBadge';
import TaskProgressBar from './TaskProgressBar';

import '../styles/TaskDetail.css';

function TaskDetailComponent() {

    const params = useParams();
    const currentId = params.taskNo;
    const navigate = useNavigate();
    
        const [task, setTask] = useState({
                                            taskNo:"",
                                            taskTitle:"",
                                            taskContent:"",
                                            taskWriter:"",
                                            deptname:"",
                                            /*tasktime_at:"",
                                            taskend_at:"",*/
                                            status:"",
                                            progress:0,
                                            originName:"",
                                            changeName:"",
                                            
        })

    useEffect(() => {
        const selectTask = async () => {

            try {

                //더미데이터 DB시 삭제
                const allDummyList = [
                    { taskNo: 1, taskTitle: "샘플업무1", taskWriter: "김철수", deptName: "기획부", status: "업무 준비(0%)", taskContent: "샘플업무 1번 상세 내용입니다.", originName: "업무지시서_v1.pdf" },
                    { taskNo: 2, taskTitle: "샘플업무2", taskWriter: "이영희", deptName: "개발부", status: "진행 중 (1 ~ 50%)", taskContent: "샘플업무 2번 상세 내용입니다.", originName: "기획안.docx" },
                    { taskNo: 3, taskTitle: "샘플업무3", taskWriter: "박민수", deptName: "데이터부", status: "진행 중 (51 ~ 99%)", taskContent: "샘플업무 3번 상세 내용입니다.", originName: "시안.png" },
                    { taskNo: 4, taskTitle: "샘플업무4", taskWriter: "최수진", deptName: "마케팅부", status: "완료 요청(100%)", taskContent: "샘플업무 4번 상세 내용입니다.", originName: "" },
                    { taskNo: 5, taskTitle: "샘플업무5", taskWriter: "정우성", deptName: "영업부", status: "업무 완료", taskContent: "샘플업무 5번 상세 내용입니다.", originName: "최종보고서.pptx" },
                    { taskNo: 6, taskTitle: "샘플업무6", taskWriter: "김철수", deptName: "개발부", status: "진행 중 (1 ~ 50%)", taskContent: "샘플업무 6번 상세 내용입니다.", originName: "" },
                    { taskNo: 7, taskTitle: "샘플업무7", taskWriter: "이영희", deptName: "기획부", status: "업무 준비(0%)", taskContent: "샘플업무 7번 상세 내용입니다.", originName: "참고자료.pdf" },
                    { taskNo: 8, taskTitle: "샘플업무8", taskWriter: "박민수", deptName: "디자인부", status: "업무 완료", taskContent: "샘플업무 8번 상세 내용입니다.", originName: "" },
                    { taskNo: 9, taskTitle: "샘플업무9", taskWriter: "최수진", deptName: "마케팅부", status: "진행 중 (51 ~ 99%)", taskContent: "샘플업무 9번 상세 내용입니다.", originName: "홍보시안.jpg" },
                    { taskNo: 10, taskTitle: "샘플업무10", taskWriter: "정우성", deptName: "영업부", status: "완료 요청(100%)", taskContent: "샘플업무 10번 상세 내용입니다.", originName: "" },
                    { taskNo: 11, taskTitle: "샘플업무11", taskWriter: "김철수", deptName: "개발부", status: "진행 중 (51 ~ 99%)", taskContent: "샘플업무 11번 상세 내용입니다.", originName: "API_v2.pdf" },
                    { taskNo: 12, taskTitle: "샘플업무12", taskWriter: "이영희", deptName: "기획부", status: "업무 준비(0%)", taskContent: "샘플업무 12번 상세 내용입니다.", originName: "" },
                    { taskNo: 13, taskTitle: "샘플업무13", taskWriter: "박민수", deptName: "디자인부", status: "완료 요청(100%)", taskContent: "샘플업무 13번 상세 내용입니다.", originName: "최종시안.zip" },
                    { taskNo: 14, taskTitle: "샘플업무14", taskWriter: "최수진", deptName: "마케팅부", status: "진행 중 (1 ~ 50%)", taskContent: "샘플업무 14번 상세 내용입니다.", originName: "" },
                    { taskNo: 15, taskTitle: "샘플업무15", taskWriter: "정우성", deptName: "영업부", status: "업무 완료", taskContent: "샘플업무 15번 상세 내용입니다.", originName: "계약서.pdf" },
                    { taskNo: 16, taskTitle: "샘플업무16", taskWriter: "김철수", deptName: "개발부", status: "진행 중 (51 ~ 99%)", taskContent: "샘플업무 16번 상세 내용입니다.", originName: "" },
                    { taskNo: 17, taskTitle: "샘플업무17", taskWriter: "이영희", deptName: "기획부", status: "업무 준비(0%)", taskContent: "샘플업무 17번 상세 내용입니다.", originName: "기획서_최종.docx" }
                ];

                const targetTask = allDummyList.find(item => item.taskNo === Number(currentId));
                                
                if (targetTask){
                    //TaskStatusBadge 에서 받아온 함수로 계산
                    const calculatedProgress = targetTask.progress !== undefined
                            ?  targetTask.progress
                            : getProgressByStatus(targetTask.status);

                    setTask({...targetTask, progress:calculatedProgress});                
                } else {
                    //조회 내용이 없을 시
                    alert("존재하지않는 글입니다.");

                    //업무 리스트로 이동
                    navigate("/task/list");
                }
            } catch (error) {
                console.log("통신실패");
            }
        }
        selectTask();
    }, [currentId, navigate])

    //실행구문

    //return구문
    return (
        <div style={{ width: "1000px" }}>

            <h2 align="center">업무</h2>

            <br /><br />
            <div>
                <table className="table content">
                    <tbody>
                        <tr>
                            <th>제목</th>
                            <td colSpan={3}>{task.taskTitle}</td>
                        </tr>
                        <tr>
                            <th>작성자</th>
                            <td style={{width:"500px"}}>
                                {task.taskWriter}
                            </td>
                            <th>담당부서</th>
                            <td>{task.deptName}</td>
                        </tr>
                        <tr>
                            <th>진행도</th>
                            <td></td>
                            <td colSpan={2}>
                                <TaskProgressBar progress={task.progress}/>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4} style={{height:"250px"}}>
                               <textarea className="content-area"
                                            value={task.taskContent ||''}
                                            readOnly/>
                            </td>
                        </tr>
                        <tr>
                            <th>첨부파일</th>
                            <td colSpan={3}>

                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="btn-set">
                    <button className="back"
                        onClick={() => { navigate("/task/list"); }}>
                        목록
                    </button>
                    <div className="upDel-btn">
                        <button className="up-btn"
                            onClick={(e) => { e.stopPropagation(); }}>
                            수정
                        </button>
                        <button className="del-btn"
                            onClick={(e) => { e.stopPropagation(); }}>
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetailComponent;
import React from "react";

const statusClassMap = {
            "업무 준비(0%)": {color:"#6c757d", progress:0},//회색
            "진행 중 (1 ~ 50%)": {color:"#dc3545", progress:30},//빨강
            "진행 중 (51 ~ 99%)": {color:"#ffc107", progress:75},//노랑
            "완료 요청(100%)": {color:"#0d6efd", progress:100},//파랑
            "업무 완료": {color:"#198754", progress:100}//초록         
        };

        export const getProgressByStatus = (status)=>{
            return STATUS_CONFIG[status]?.progress ?? 0;
        }

        function TaskStatusBadge({status}){
            const targetConfig= statusClassMap[status] ||{ color: "#6c757d", progress: 0 };

            return(
                <span className="status-badge"
                        style={{ backgroundColor: targetConfig.color, color: "#fff", padding: "4px 8px", borderRadius: "4px" }}>
                    {status}
                </span>
            )
        }

        export default TaskStatusBadge;
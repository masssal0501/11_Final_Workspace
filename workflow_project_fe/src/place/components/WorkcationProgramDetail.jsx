import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { programApi } from "../../api/programApi";

function WorkcationProgramDetail() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [program, setProgram] = useState(null);

    // 관리자 여부 확인
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    useEffect(() => {
        selectProgramDetail();
    }, [hubNo]);

    const selectProgramDetail = async () => {

        try {
            const response = await programApi.getProgramDetail(hubNo);
            setProgram(response);
        } catch (error) {
            console.log("체험 프로그램 상세조회 실패");
        }
    };

    if (!program) {
        return <div>로딩중...</div>;
    }

    return (
        <div>
            <h2>체험 프로그램 상세조회</h2>

            <hr />

            <div>

                <div className="program-info">

                    <p>
                        {program.programName}
                    </p>

                    <p>
                        <h4>위치 : </h4>
                        {program.hubAddress}
                    </p>

                    <p>
                        <h4>전화번호 : </h4>
                        {program.phone}
                    </p>

                    <p>
                        <h4>프로그램 설명 : </h4>
                        {program.description}
                    </p>

                </div>

            </div>

            <div>

                {/* 관리자에게만 수정하기 버튼 표시 */}
                {isAdmin && (
                    <button
                        onClick={() => navigate(`/workcation/program/${hubNo}/edit`)}
                    >
                        수정하기
                    </button>
                )}

                <button onClick={() => navigate(-1)}>
                    뒤로가기
                </button>

            </div>

        </div>
    );
}

export default WorkcationProgramDetail;
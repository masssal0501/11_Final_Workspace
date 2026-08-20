import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { programApi } from "../../api/programApi";

function WorkcationProgramEdit() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [program, setProgram] = useState(null);

    // 관리자 여부 확인
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    useEffect(() => {

        // 관리자가 아니면 상세 페이지로 돌려보내기
        if (!isAdmin) {
            alert("관리자만 수정할 수 있습니다.");
            navigate(-1);
            return;
        }

        selectProgramEdit();

    }, [hubNo]);

    const selectProgramEdit = async () => {

        try {

            const response = await programApi.getProgramEdit(hubNo);

            setProgram(response);

        } catch (error) {

            console.log("체험 프로그램 정보 조회 실패");

        }
    };

    if (!program) {
        return <div>로딩중...</div>;
    }

    return (
        <div>

            <h2>체험 프로그램 수정</h2>

            <hr />

            <div className="program-info">

                <p>
                    <h4>프로그램명 : </h4>
                    <input
                        type="text"
                        value={program.programName}
                        onChange={(e) =>
                            setProgram({
                                ...program,
                                programName: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>위치 : </h4>
                    <input
                        type="text"
                        value={program.hubAddress}
                        onChange={(e) =>
                            setProgram({
                                ...program,
                                hubAddress: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>전화번호 : </h4>
                    <input
                        type="text"
                        value={program.phone}
                        onChange={(e) =>
                            setProgram({
                                ...program,
                                phone: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>프로그램 설명 : </h4>
                    <textarea
                        value={program.description}
                        onChange={(e) =>
                            setProgram({
                                ...program,
                                description: e.target.value
                            })
                        }
                    />
                </p>

            </div>

            <div>

                <button >
                    저장하기
                </button>

                <button onClick={() => navigate(-1)}>
                    뒤로가기
                </button>

            </div>

        </div>
    );
}

export default WorkcationProgramEdit;
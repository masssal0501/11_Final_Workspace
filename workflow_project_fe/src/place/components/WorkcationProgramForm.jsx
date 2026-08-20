import { useNavigate } from "react-router-dom";

function WorkcationProgramForm() {

    const navigate = useNavigate();

    return (
        <div>
            <h2>체험 프로그램 등록</h2>

            <hr />

            <form>
                <div>
                    <h4>프로그램명 :</h4>
                    <input
                        type="text"
                        name="programName"
                        id="programName"
                        placeholder="프로그램명을 입력해주세요."
                    />

                    <h4>위치 :</h4>
                    <input
                        type="text"
                        name="hubAddress"
                        id="hubAddress"
                        placeholder="주소를 입력해주세요."
                    />

                    <h4>전화번호 :</h4>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="전화번호를 입력해주세요."
                    />

                    <h4>프로그램 설명 :</h4>
                    <textarea
                        name="description"
                        id="description"
                        placeholder="프로그램 설명을 입력해주세요."
                    />
                </div>
            </form>

            <button>등록하기</button>

            <button onClick={() => navigate(-1)}>
                뒤로가기
            </button>
        </div>
    );
}

export default WorkcationProgramForm;
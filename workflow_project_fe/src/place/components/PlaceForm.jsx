import { useNavigate } from "react-router-dom";

function PlaceForm() {

    const navigate = useNavigate();

    return (
        <div>
            <h2>지역 정보 등록</h2>

            <hr />

            <form>
                <div>
                    <h4>지역명 :</h4>
                    <input
                        type="text"
                        name="hubName"
                        id="hubName"
                        placeholder="지역명을 입력해주세요."
                    />

                    <h4>주소 :</h4>
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

                    <h4>지역 설명 :</h4>
                    <textarea
                        name="description"
                        id="description"
                        placeholder="지역 설명을 입력해주세요."
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

export default PlaceForm;
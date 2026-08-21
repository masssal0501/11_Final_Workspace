import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { placeApi } from "../../api/placeApi";

function PlaceEdit() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [place, setPlace] = useState(null);

    // 관리자 여부 확인
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    useEffect(() => {

        // 관리자가 아니면 이전 페이지로 돌려보내기
        if (!isAdmin) {
            alert("관리자만 수정할 수 있습니다.");
            navigate(-1);
            return;
        }

        selectPlaceEdit();

    }, [hubNo]);

    const selectPlaceEdit = async () => {

        try {

            const response = await placeApi.getPlaceEdit(hubNo);

            setPlace(response);

        } catch (error) {

            console.log("지역 정보 조회 실패");

        }
    };

    if (!place) {
        return <div>로딩중...</div>;
    }

    return (
        <div>

            <h2>지역 정보 수정</h2>

            <hr />

            <div className="place-info">

                <p>
                    <h4>지역명 : </h4>
                    <input
                        type="text"
                        value={place.hubName}
                        onChange={(e) =>
                            setPlace({
                                ...place,
                                hubName: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>주소 : </h4>
                    <input
                        type="text"
                        value={place.hubAddress}
                        onChange={(e) =>
                            setPlace({
                                ...place,
                                hubAddress: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>전화번호 : </h4>
                    <input
                        type="text"
                        value={place.phone}
                        onChange={(e) =>
                            setPlace({
                                ...place,
                                phone: e.target.value
                            })
                        }
                    />
                </p>

                <p>
                    <h4>지역 설명 : </h4>
                    <textarea
                        value={place.description}
                        onChange={(e) =>
                            setPlace({
                                ...place,
                                description: e.target.value
                            })
                        }
                    />
                </p>

            </div>

            <div>

                <button>
                    저장하기
                </button>

                <button onClick={() => navigate(-1)}>
                    뒤로가기
                </button>

            </div>

        </div>
    );
}

export default PlaceEdit;
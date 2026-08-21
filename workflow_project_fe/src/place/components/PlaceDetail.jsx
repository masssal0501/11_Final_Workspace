import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { placeApi } from "../../api/placeApi";

function PlaceDetail() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [place, setPlace] = useState(null);

    // 관리자 여부 확인
    const role = localStorage.getItem("role");
    const isAdmin = role === "ADMIN";

    useEffect(() => {
        selectPlaceDetail();
    }, [hubNo]);

    const selectPlaceDetail = async () => {

        try {
            const response = await placeApi.getPlaceDetail(hubNo);
            setPlace(response);
        } catch (error) {
            console.log("지역 정보 상세조회 실패");
        }
    };

    if (!place) {
        return <div>로딩중...</div>;
    }

    return (
        <div>
            <h2>지역 정보 상세조회</h2>

            <hr />

            <div>

                <div className="place-info">

                    <p>
                        {place.hubName}
                    </p>

                    <p>
                        {place.regionName}
                    </p>

                    <p>
                        <h4>주소 : </h4>
                        {place.hubAddress}
                    </p>

                    <p>
                        <h4>전화번호 : </h4>
                        {place.phone}
                    </p>

                    <p>
                        <h4>설명 : </h4>
                        {place.description}
                    </p>

                </div>

            </div>

            <div>

                {/* 관리자에게만 수정하기 버튼 표시 */}
                {isAdmin && (
                    <button
                        onClick={() => navigate(`/place/${hubNo}/edit`)}>
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

export default PlaceDetail;
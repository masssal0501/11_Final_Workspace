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


    // 지역 정보 상세 조회
    const selectPlaceDetail = async () => {

        try {

            const response = await placeApi.getPlaceDetail(hubNo);

            setPlace(response);

        } catch (error) {

            console.log("지역 정보 상세조회 실패", error);

        }

    };


    // 로딩
    if (!place) {

        return <div>로딩중...</div>;

    }


    // 허브 상태 표시
    const getHubStatusText = (status) => {

        if (status === "OPEN") {
            return "운영중";
        }

        if (status === "PAUSED") {
            return "일시중단";
        }

        if (status === "CLOSED") {
            return "종료";
        }

        return status;

    };


    return (

        <div>

            <h2>지역 정보 상세조회</h2>

            <hr />


            <div className="place-info">

                {/* 사진 */}
                <div className="place-image">

                    {place.filePath ? (

                        <img
                            src={`http://localhost:8080${place.filePath}`}
                            alt={place.hubName}
                            style={{
                                width: "400px",
                                height: "300px",
                                objectFit: "cover"
                            }}
                        />

                    ) : (

                        <div>
                            등록된 사진이 없습니다.
                        </div>

                    )}

                </div>


                {/* 제목 */}
                <h3>
                    {place.hubName}
                </h3>


                {/* 지역 */}
                <p>

                    <strong>지역명 : </strong>

                    {place.mainRegion}

                </p>


                {/* 상세 지역 */}
                <p>

                    <strong>상세지역명 : </strong>

                    {place.subRegion}

                </p>


                {/* 장소 유형 */}
                <p>

                    <strong>장소 유형 : </strong>

                    {place.hubType}

                </p>


                {/* 주소 */}
                <p>

                    <strong>주소 : </strong>

                    {place.hubAddress}

                </p>


                {/* 전화번호 */}
                <p>

                    <strong>전화번호 : </strong>

                    {place.phone}

                </p>


                {/* 설명 */}
                <p>

                    <strong>설명 : </strong>

                    {place.description}

                </p>


                {/* 허브 상태 */}
                <p>

                    <strong>운영 상태 : </strong>

                    {getHubStatusText(place.hubStatus)}

                </p>

            </div>


            <div>

                {/* 관리자에게만 수정하기 버튼 표시 */}
                {isAdmin && (

                    <button
                        onClick={() => navigate(`/place/${hubNo}/edit`)}
                    >
                        수정하기
                    </button>

                )}


                <button
                    onClick={() => navigate(-1)}
                >
                    뒤로가기
                </button>

            </div>

        </div>

    );

}

export default PlaceDetail;
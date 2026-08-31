import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { placeApi } from "../api/placeApi";

import "../style/placeDetail.css";

function PlaceDetail() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [place, setPlace] = useState(null);

    // 관리자 여부 확인
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.authCode === "ADMIN";


    useEffect(() => {

        selectPlaceDetail();

    }, [hubNo]);


    // 지역 정보 상세 조회
    const selectPlaceDetail = async () => {

        try {

            const response = await placeApi.getPlaceDetail(hubNo);

            console.log("상세조회 데이터:", response);

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


    // 첫 번째 사진
    const firstFile = place.hubFileList?.find(
    (file) => file.status === "Y"
    );


    return (

        <div className="place-info">

            <h2>지역 정보 상세조회</h2>

            <hr />


            <div>
            {/* 사진 */}
            <div className="place-image">

                {firstFile ? (

                    <img
                        src={`http://localhost:8006/workflow${firstFile.filePath}/${firstFile.changeName}`}
                        alt={place.hubName}

                    />

                ) : (

                    <div>
                        등록된 사진이 없습니다.
                    </div>

                )}

            </div>


                {/* 제목 */}
                <div className="Title-box">
                    <h3 align="center">{place.hubName}</h3>
                </div>

                <br />


                {/* 평점 */}
                <div className="place-rating">

                    <span className="rating-star">⭐️</span>

                    <span className="rating-score">
                        평점
                    </span>

                    <span className="rating-value">
                        -
                    </span>

                </div>


                {/* 설명 */}
                <div>

                    <strong>상세 정보</strong>

                    <br />

                    <div className="description">
                        {place.description}
                    </div>

                </div>

                <br />


                {/* 주소 */}
                <div>

                    <strong>주소</strong>

                    <br />

                    {place.mainRegion} {place.subRegion} {place.hubAddress}

                </div>

                <br />


                {/* 전화번호 */}
                <div>

                    <strong>전화번호</strong>

                    <br />

                    {place.phone}

                </div>

                <br />


                {/* 허브 상태 */}
                <div>

                    <strong>운영 상태</strong>

                    <br />

                    {getHubStatusText(place.hubStatus)}

                </div>

            </div>


            <div className="button">

                {/* 관리자에게만 수정하기 버튼 표시 */}
                {isAdmin && (

                    <button
                        className="editButton"
                        onClick={() =>
                            navigate(`/workflow/place/edit/${hubNo}`)
                        }
                    >
                        수정하기
                    </button>

                )}


                <button
                    className="backButton"
                    onClick={() => navigate("/workflow/place/list")}
                >
                    목록으로
                </button>

            </div>

        </div>

    );

}

export default PlaceDetail;
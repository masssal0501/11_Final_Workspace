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

            setPlace(response);

        } catch (error) {

            console.log("지역 정보 상세조회 실패", error);

        }

    };


    // 대표 이미지(status === "Y") 1건
    // (로딩 처리는 아래 JSX에서 인라인으로 하므로 place가 null일 수 있음 - 옵셔널 체이닝 유지)
    const mainFile = place?.hubFileList?.find(
        file => file.status === "Y"
    );


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


    // 허브 상태 뱃지 색상
    const getHubStatusBadgeClass = (status) => {

        if (status === "OPEN") {
            return "wf-badge wf-badge-success";
        }

        if (status === "PAUSED") {
            return "wf-badge wf-badge-warning";
        }

        return "wf-badge wf-badge-neutral";

    };


    return (

        <main className="wf-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">지역 정보 상세</h1>
                    <p className="wf-page-description">거점 주변 지역의 상세 정보를 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="place-info">

            {/* 로딩 상태 */}
            {!place ? (

                <div className="wf-state">
                    <div className="wf-spinner" />
                    <div className="wf-state-title">지역 정보를 불러오는 중입니다.</div>
                </div>

            ) : (
            <>

            <div>


                {/* 사진 */}
                <div className="place-image">
                    {mainFile ? (
                        <img
                            src={`http://localhost:8006/workflow${mainFile.filePath}/${mainFile.changeName}`}
                            alt={place.hubName}
                        />
                    ) : (

                        <div className="wf-state">
                            <div className="wf-state-title">등록된 사진이 없습니다.</div>
                        </div>

                    )}
                </div>


                {/* 제목 */}
                <div className="Title-box">
                    <h3 align="center">{place.hubName}</h3>
                </div>

                <br />

                <div className="place-rating">
                    <span className="rating-star">⭐️</span>
                    <span className="rating-score">평점</span>
                    <span className="rating-value">-</span>
                </div>

                {/* 설명 */}
                <div>

                    <strong>상세 정보</strong>
                    <br />
                    <div className="description">{place.description}</div>

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
                    <span className={getHubStatusBadgeClass(place.hubStatus)}>
                        {getHubStatusText(place.hubStatus)}
                    </span>

                </div>

            </div>


            <div className="button">

                {/* 관리자에게만 수정하기 버튼 표시 */}
                {isAdmin && (

                    <button className="editButton"
                        onClick={() => navigate(`/place/edit/${hubNo}`)}
                    >
                        수정하기
                    </button>

                )}


                <button className="backButton"
                    onClick={() => navigate(-1)}
                >
                    뒤로가기
                </button>

            </div>

            </>
            )}

            </div>
            </div>
        </main>

    );

}

export default PlaceDetail;
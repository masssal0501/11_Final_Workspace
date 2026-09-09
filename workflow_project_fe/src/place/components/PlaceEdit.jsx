import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { placeApi } from "../api/placeApi";

function PlaceEdit() {

    const { hubNo } = useParams();

    const navigate = useNavigate();

    const [place, setPlace] = useState(null);

    // 관리자 여부 확인
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.authCode === "ADMIN";

    const [file, setFile] = useState(null);


    // 메인 지역별 하위 지역
    const subRegionList = {

        "강원도": [
            "강릉시",
            "속초시",
            "양양군",
            "춘천시",
            "평창군"
        ],

        "부산": [
            "해운대구",
            "영도구",
            "수영구",
            "부산진구",
            "중구"
        ],

        "제주도": [
            "서귀포시",
            "제주시"
        ]

    };


    useEffect(() => {

        // 관리자가 아니면 이전 페이지로 돌려보내기
        if (!isAdmin) {

            alert("관리자만 수정할 수 있습니다.");

            navigate(-1);

            return;

        }

        selectPlaceEdit();

    }, [hubNo]);


    // 지역 정보 수정 페이지 조회
    const selectPlaceEdit = async () => {

        try {

            const response = await placeApi.getPlaceDetail(hubNo);

            setPlace(response);

        } catch (error) {

            console.log("지역 정보 조회 실패", error);

        }

    };


    // 수정할 값 변경
    const handleChange = (e) => {

        const { name, value } = e.target;


        // 메인 지역 변경
        if (name === "mainRegion") {

            setPlace({
                ...place,
                mainRegion: value,
                subRegion: ""
            });

            return;

        }


        setPlace({
            ...place,
            [name]: value
        });

    };


    // 저장하기
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await placeApi.updatePlace(
                hubNo,
                place
            );

            alert("지역 정보가 수정되었습니다.");

            navigate(`/workflow/place/detail/${hubNo}`);

        } catch (error) {

            console.log("지역 정보 수정 실패", error);

            alert("지역 정보 수정에 실패했습니다.");

        }

    };


    return (

        <main className="wf-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">지역 정보 수정</h1>
                    <p className="wf-page-description">등록된 지역 정보를 수정합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="place-info">

            {!place ? (

                <div className="wf-state">
                    <div className="wf-spinner" />
                    <div className="wf-state-title">지역 정보를 불러오는 중입니다.</div>
                </div>

            ) : (

            <form onSubmit={handleSubmit}>

                <div>


                    {/* 거점 이름 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="hubName">거점 이름</label>

                        <input
                            id="hubName"
                            type="text"
                            name="hubName"
                            className="wf-input"
                            value={place.hubName || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 메인 지역 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="mainRegion">지역명</label>

                        <select
                            id="mainRegion"
                            name="mainRegion"
                            className="wf-select"
                            value={place.mainRegion || ""}
                            onChange={handleChange}
                        >

                            <option value="">
                                지역을 선택해주세요.
                            </option>

                            <option value="강원도">
                                강원도
                            </option>

                            <option value="부산">
                                부산
                            </option>

                            <option value="제주도">
                                제주도
                            </option>

                        </select>

                    </div>


                    {/* 하위 지역 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="subRegion">상세지역명</label>

                        <select
                            id="subRegion"
                            name="subRegion"
                            className="wf-select"
                            value={place.subRegion || ""}
                            onChange={handleChange}
                            disabled={!place.mainRegion}
                        >

                            <option value="">
                                {place.mainRegion
                                    ? "상세 지역을 선택해주세요."
                                    : "지역을 먼저 선택해주세요."
                                }
                            </option>

                            {place.mainRegion &&
                                subRegionList[place.mainRegion]?.map((subRegion) => (

                                    <option
                                        key={subRegion}
                                        value={subRegion}
                                    >
                                        {subRegion}
                                    </option>

                                ))
                            }

                        </select>

                    </div>


                    {/* 장소 유형 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="hubType">장소 유형</label>

                        <select
                            id="hubType"
                            name="hubType"
                            className="wf-select"
                            value={place.hubType || ""}
                            onChange={handleChange}
                        >

                            <option value="">
                                장소 유형을 선택해주세요.
                            </option>

                            <option value="3">
                                체험 프로그램
                            </option>

                            <option value="4">
                                맛집
                            </option>

                            <option value="5">
                                관광지
                            </option>

                        </select>

                    </div>


                    {/* 운영 상태 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="hubStatus">운영 상태</label>

                        <select
                            id="hubStatus"
                            name="hubStatus"
                            className="wf-select"
                            value={place.hubStatus || ""}
                            onChange={handleChange}
                        >

                            <option value="OPEN">
                                🟢 운영중
                            </option>

                            <option value="PAUSED">
                                🟠 일시중단
                            </option>

                            <option value="CLOSED">
                                🔴 종료
                            </option>

                        </select>

                    </div>


                    {/* 주소 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="hubAddress">주소</label>

                        <input
                            id="hubAddress"
                            type="text"
                            name="hubAddress"
                            className="wf-input"
                            value={place.hubAddress || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 전화번호 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="phone">전화번호</label>

                        <input
                            id="phone"
                            type="text"
                            name="phone"
                            className="wf-input"
                            value={place.phone || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 설명 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="description">지역 설명</label>

                        <textarea
                            id="description"
                            name="description"
                            className="wf-textarea"
                            value={place.description || ""}
                            onChange={handleChange}
                        />

                    </div>

                    {/* 사진 첨부 */}
                    <div className="wf-form-group">

                        <label className="wf-label" htmlFor="placeFile">사진 첨부</label>

                        <input
                            id="placeFile"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                    </div>


                </div>


                <div className="wf-page-actions">

                    <button type="submit" className="btn btn-primary">
                        저장하기
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        뒤로가기
                    </button>

                </div>

            </form>

            )}

            </div>
            </div>
        </main>

    );

}

export default PlaceEdit;
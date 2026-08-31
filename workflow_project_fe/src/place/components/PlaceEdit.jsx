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


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const formData = new FormData();

            formData.append(
                "place",
                new Blob(
                    [JSON.stringify(place)],
                    {
                        type: "application/json"
                    }
                )
            );

            if (file) {
                formData.append("file", file);
            }

            console.log("IS FORMDATA :", formData instanceof FormData);

            await placeApi.updatePlace(
                hubNo,
                formData
            );

            alert("지역 정보가 수정되었습니다.");

            navigate(`/place/${hubNo}`);

        } catch (error) {

            console.log("지역 정보 수정 실패", error);
            console.log("response:", error.response?.data);

            alert("지역 정보 수정에 실패했습니다.");

        }
    };


    if (!place) {

        return <div>로딩중...</div>;

    }


    return (

        <div className="place-info">

            <h2>지역 정보 수정</h2>

            <hr />


            <form onSubmit={handleSubmit}>

                <div>


                    {/* 거점 이름 */}
                    <div className="formGroup">

                        <h4>거점 이름 : </h4>

                        <input
                            type="text"
                            name="hubName"
                            value={place.hubName || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 메인 지역 */}
                    <div className="formGroup">

                        <h4>지역명 : </h4>

                        <select
                            name="mainRegion"
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
                    <div className="formGroup">
                        <h4>상세지역명 : </h4>

                        <select
                            name="subRegion"
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
                    <div className="formGroup">
                            <div className="Detail">
                        <h4>장소 유형 : </h4>

                        <select
                            name="hubType"
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
                    </div>


                    {/* 운영 상태 */}
                    <div className="formGroup">

                        <h4>운영 상태 : </h4>

                        <select
                            name="hubStatus"
                            value={place.hubStatus || ""}
                            onChange={handleChange}
                        >

                            <option value="OPEN">
                                ✅
                            </option>

                            <option value="PAUSED">
                                ⚠️
                            </option>

                            <option value="CLOSED">
                                🚫
                            </option>

                        </select>

                    </div>


                    {/* 주소 */}
                    <div className="formGroup">

                        <h4>주소 : </h4>

                        <input
                            type="text"
                            name="hubAddress"
                            value={place.hubAddress || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 전화번호 */}
                    <div className="formGroup">

                        <h4>전화번호 : </h4>

                        <input
                            type="text"
                            name="phone"
                            value={place.phone || ""}
                            onChange={handleChange}
                        />

                    </div>


                    {/* 설명 */}
                    <div className="formGroup">

                        <h4>지역 설명 : </h4>

                        <textarea
                            name="description"
                            value={place.description || ""}
                            onChange={handleChange}
                        />

                    </div>

                    {/* 사진 첨부 */}
                    <div className="formGroup">

                        <h4>사진 첨부 : </h4>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                        />

                    </div>


                </div>

                <div className="buttonGroup">
                    <button type="submit" className="submitBtn">
                        저장하기
                    </button>
                    <button
                        type="button"
                        className="backBtn"
                        onClick={() => navigate(-1)}
                    >
                        뒤로가기
                    </button>
                </div>

            </form>

        </div>

    );

}

export default PlaceEdit;
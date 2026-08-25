import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { placeApi } from "../../api/placeApi";

function PlaceForm() {

    const navigate = useNavigate();

    const [place, setPlace] = useState({
        hubName: "",
        mainRegion: "",
        subRegion: "",
        hubType: "",
        hubStatus: "OPEN",
        hubAddress: "",
        phone: "",
        description: ""
    });

    // 사진 파일
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


    // 입력값 변경
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


    // 사진 변경
    const handleFileChange = (e) => {

        setFile(e.target.files[0]);

    };


    // 등록하기
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // FormData 생성
            const formData = new FormData();

            // 장소 정보 추가
            formData.append(
                "place",
                new Blob(
                    [JSON.stringify(place)],
                    { type: "application/json" }
                )
            );

            // 사진이 선택된 경우 추가
            if (file) {

                formData.append("file", file);

            }


            await placeApi.insertPlace(formData);

            alert("지역 정보가 등록되었습니다.");

            navigate("/place");

        } catch (error) {

            console.log("지역 정보 등록 실패", error);

            alert("지역 정보 등록에 실패했습니다.");

        }

    };


    return (
        <div>

            <h2>지역 정보 등록</h2>

            <hr />

            <form onSubmit={handleSubmit}>

                <div>

                    <h4>제목 :</h4>

                    <input
                        type="text"
                        name="hubName"
                        value={place.hubName}
                        onChange={handleChange}
                        placeholder="제목을 입력해주세요."
                    />


                    {/* 메인 지역 */}
                    <h4>지역명 :</h4>

                    <select
                        name="mainRegion"
                        value={place.mainRegion}
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


                    {/* 하위 지역 */}
                    <h4>상세지역명 :</h4>

                    <select
                        name="subRegion"
                        value={place.subRegion}
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
                            subRegionList[place.mainRegion].map((subRegion) => (

                                <option
                                    key={subRegion}
                                    value={subRegion}
                                >
                                    {subRegion}
                                </option>

                            ))
                        }

                    </select>


                    {/* 장소 유형 */}
                    <h4>장소 유형 :</h4>

                    <select
                        name="hubType"
                        value={place.hubType}
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


                    {/* 주소 */}
                    <h4>주소 :</h4>

                    <input
                        type="text"
                        name="hubAddress"
                        value={place.hubAddress}
                        onChange={handleChange}
                        placeholder="주소를 입력해주세요."
                    />


                    {/* 전화번호 */}
                    <h4>전화번호 :</h4>

                    <input
                        type="text"
                        name="phone"
                        value={place.phone}
                        onChange={handleChange}
                        placeholder="전화번호를 입력해주세요."
                    />


                    {/* 지역 설명 */}
                    <h4>지역 설명 :</h4>

                    <textarea
                        name="description"
                        value={place.description}
                        onChange={handleChange}
                        placeholder="지역 설명을 입력해주세요."
                    />


                    {/* 상태 */}
                    <h4>상태 :</h4>

                    <select
                        name="hubStatus"
                        value={place.hubStatus}
                        onChange={handleChange}
                    >

                        <option value="OPEN">
                            ✅🟢
                        </option>

                        <option value="PAUSED">
                            🟠
                        </option>

                        <option value="CLOSED">
                            ❌🔴
                        </option>

                    </select>


                    {/* 사진 */}
                    <h4>사진 :</h4>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                </div>


                <button type="submit">
                    등록하기
                </button>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    뒤로가기
                </button>

            </form>

        </div>
    );
}

export default PlaceForm;
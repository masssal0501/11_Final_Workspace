import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeApi } from "../api/placeApi";
import "../style/placeForm.css"; // CSS 파일 임포트

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

    const [file, setFile] = useState(null);

    const subRegionList = {
        "강원도": ["강릉시", "속초시", "양양군", "춘천시", "평창군"],
        "부산": ["해운대구", "영도구", "수영구", "부산진구", "중구"],
        "제주도": ["서귀포시", "제주시"]
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // 등록하기
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {
            const formData = new FormData();

            // 백엔드가 DTO로 정상 바인딩할 수 있도록 hubType을 확실하게 숫자로 변환
            const submitData = {
                ...place,
                hubType: Number(place.hubType)
            };

            // 장소 정보 JSON Blob 추가
            formData.append(
                "place",
                new Blob(
                    [JSON.stringify(submitData)],
                    {
                        type: "application/json"
                    }
                )
            );

            // 사진 파일 추가 (선택사항)
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
        <div className="formContainer">
            <h2>지역 정보 등록</h2>
            <hr />

            <form onSubmit={handleSubmit}>
                <div className="formGroup">
                    <h4>제목</h4>
                    <input
                        type="text"
                        name="hubName"
                        value={place.hubName}
                        onChange={handleChange}
                        placeholder="제목을 입력해주세요."
                    />
                </div>

                <div className="formGroup">
                    <h4>지역명</h4>
                    <select
                        name="mainRegion"
                        value={place.mainRegion}
                        onChange={handleChange}
                    >
                        <option value="">지역을 선택해주세요.</option>
                        <option value="강원도">강원도</option>
                        <option value="부산">부산</option>
                        <option value="제주도">제주도</option>
                    </select>
                </div>

                <div className="formGroup">
                    <h4>상세지역명</h4>
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
                                <option key={subRegion} value={subRegion}>
                                    {subRegion}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div className="formGroup">
                    <h4>장소 유형</h4>
                    <select
                        name="hubType"
                        value={place.hubType}
                        onChange={handleChange}
                    >
                        <option value="">장소 유형을 선택해주세요.</option>
                        <option value="3">체험 프로그램</option>
                        <option value="4">맛집</option>
                        <option value="5">관광지</option>
                    </select>
                </div>

                <div className="formGroup">
                    <h4>주소</h4>
                    <input
                        type="text"
                        name="hubAddress"
                        value={place.hubAddress}
                        onChange={handleChange}
                        placeholder="주소를 입력해주세요."
                    />
                </div>

                <div className="formGroup">
                    <h4>전화번호</h4>
                    <input
                        type="text"
                        name="phone"
                        value={place.phone}
                        onChange={handleChange}
                        placeholder="전화번호를 입력해주세요."
                    />
                </div>

                <div className="formGroup">
                    <h4>지역 설명</h4>
                    <textarea
                        name="description"
                        value={place.description}
                        onChange={handleChange}
                        placeholder="지역 설명을 입력해주세요."
                    />
                </div>

                <div className="formGroup">
                    <h4>상태</h4>
                    <select name="hubStatus" value={place.hubStatus} onChange={handleChange}>
                        <option value="OPEN">✅ 운영중</option>
                        <option value="PAUSED">⚠️ 일시중단</option>
                        <option value="CLOSED">🚫 종료</option>
                    </select>
                </div>
{/* ⚠️✅❌🚫 🟢🟠🔴 */}
                <div className="formGroup">
                    <h4>대표 사진</h4>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="buttonGroup">
                    <button type="submit" className="submitBtn">
                        등록하기
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

export default PlaceForm;
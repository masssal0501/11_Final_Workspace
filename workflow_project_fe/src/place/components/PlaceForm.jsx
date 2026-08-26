import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { placeApi } from "../../api/placeApi";

function PlaceForm() {

    const navigate = useNavigate();

    const [place, setPlace] = useState({
        hubName: "",
        regionName: "",
        hubType: "",
        hubAddress: "",
        phone: "",
        description: ""
    });


    // 입력값 변경
    const handleChange = (e) => {

        setPlace({
            ...place,
            [e.target.name]: e.target.value
        });

    };


    // 등록하기
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await placeApi.insertPlace(place);

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


                    <h4>지역명 :</h4>

                    <select
                        name="regionName"
                        value={place.regionName}
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


                    <h4>장소 유형 :</h4>

                    <select
                        name="hubType"
                        value={place.hubType}
                        onChange={handleChange}
                    >
                        <option value="">
                            장소 유형을 선택해주세요.
                        </option>

                        <option value="1">
                            거점
                        </option>

                        <option value="2">
                            숙소
                        </option>

                        <option value="4">
                            체험 프로그램
                        </option>

                        <option value="5">
                            맛집
                        </option>

                        <option value="6">
                            관광지
                        </option>

                    </select>


                    <h4>주소 :</h4>

                    <input
                        type="text"
                        name="hubAddress"
                        value={place.hubAddress}
                        onChange={handleChange}
                        placeholder="주소를 입력해주세요."
                    />


                    <h4>전화번호 :</h4>

                    <input
                        type="text"
                        name="phone"
                        value={place.phone}
                        onChange={handleChange}
                        placeholder="전화번호를 입력해주세요."
                    />


                    <h4>지역 설명 :</h4>

                    <textarea
                        name="description"
                        value={place.description}
                        onChange={handleChange}
                        placeholder="지역 설명을 입력해주세요."
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
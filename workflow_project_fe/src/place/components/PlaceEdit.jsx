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


    // 지역 정보 수정 페이지 조회
    const selectPlaceEdit = async () => {

        try {

            const response = await placeApi.getPlaceDetail(hubNo);

            setPlace(response);

        } catch (error) {

            console.log("지역 정보 조회 실패");

        }

    };


    // 수정할 값 변경
    const handleChange = (e) => {

        setPlace({
            ...place,
            [e.target.name]: e.target.value
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

            navigate(`/place/${hubNo}`);

        } catch (error) {

            console.log("지역 정보 수정 실패", error);

            alert("지역 정보 수정에 실패했습니다.");

        }

    };


    if (!place) {

        return <div>로딩중...</div>;

    }


    return (

        <div>

            <h2>지역 정보 수정</h2>

            <hr />


            <form onSubmit={handleSubmit}>

                <div className="place-info">


                    {/* 제목 */}
                    <p>

                        <h4>제목 : </h4>

                        <input
                            type="text"
                            name="hubName"
                            value={place.hubName || ""}
                            onChange={handleChange}
                        />

                    </p>


                    {/* 지역명 */}
                    <p>

                        <h4>지역명 : </h4>

                        <select
                            name="regionName"
                            value={place.regionName || ""}
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

                    </p>


                    {/* 장소 유형 */}
                    <p>

                        <h4>장소 유형 : </h4>

                        <select
                            name="hubType"
                            value={place.hubType || ""}
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

                    </p>


                    {/* 주소 */}
                    <p>

                        <h4>주소 : </h4>

                        <input
                            type="text"
                            name="hubAddress"
                            value={place.hubAddress || ""}
                            onChange={handleChange}
                        />

                    </p>


                    {/* 전화번호 */}
                    <p>

                        <h4>전화번호 : </h4>

                        <input
                            type="text"
                            name="phone"
                            value={place.phone || ""}
                            onChange={handleChange}
                        />

                    </p>


                    {/* 설명 */}
                    <p>

                        <h4>지역 설명 : </h4>

                        <textarea
                            name="description"
                            value={place.description || ""}
                            onChange={handleChange}
                        />

                    </p>


                </div>


                <div>

                    <button type="submit">
                        저장하기
                    </button>

                    <button
                        type="button"
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
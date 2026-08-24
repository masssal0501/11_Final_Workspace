import { useState, useEffect } from "react"
import axios from "axios";

import "../styles/WorkcationEnrollForm.css"

function WorkcationEnrollFormComponent() {

    //실행구문

    //DB에서 불러온 거점 데이터state
    const [officeList, setOfficeList] = useState([]);//오피스
    const [accommodationList, setAccommodationList] = useState([]);//숙소

    //고정 거점 선택(officeList, accommodationList)
    const [placeType, setPlaceType] = useState("office");
    const [selectedPlaceId, setSelectedPlaceId] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");

    //동적 옵션 버튼(tr 출력)
    const [showBtn1, setShowBtn1] = useState(false);//예)체험프로그램
    const [showBtn2, setShowBtn2] = useState(false);//예)맛집
    const [showBtn3, setShowBtn3] = useState(false);//예)관광지

    useEffect(() => {
        selectFacilityList();
    }, []);

    const selectFacilityList = async () => {
        try {

            /* 
               백엔드 Rest API 요청 예시
             const officeRes = await axios.get("/api/workcation/hubs?hubType=1");
               const accommRes = await axios.get("/api/workcation/hubs?hubType=2");
               setOfficeList(officeRes.data);
               setAccommodationList(accommRes.data);
            */

            //DB응답 가정(더미)
            const dummyOfficeDate = [
                { hubNo: 101, hubName: "강릉 위워크", hubAddress: "강원특별자치도 강릉시 창해로 123" },
                { hubNo: 102, hubName: "속초 패스트파이브", hubAddress: "강원특별자치도 속초시 중앙로 45" }
            ];
            const dummyAccommData = [
                { hubNo: 201, hubName: "강릉 워케이션 센터", hubAddress: "강원특별자치도 강릉시 해안로 789" },
                { hubNo: 202, hubName: "속초 리조트", hubAddress: "강원특별자치도 속초시 해변길 12" }
            ];

            setOfficeList(dummyOfficeDate);
            setAccommodationList(dummyAccommData);
        } catch (error) {
            console.log("실패", error);
        }
    }

    //거점 유형 변경 핸들러
    const handleTypeChange = (e) => {
        setPlaceType(e.target.value);
        setSelectedPlaceId("");
        setSelectedAddress("");
    }

    //거점 선택 핸들러
    const handlePlaceSelect = (e) => {
        const id = e.target.value;
        setSelectedPlaceId(id);

        const currentList = placeType === "office" ? officeList : accommodationList;
        const target = currentList.find((item) => item.hubNo === Number(id));

        selectedAddress(target ? target.hubAddress : "");
    }


    //return 구문
    return (
        <div className="workcatrion-enroll-container">
            <h2>워케이션 신청</h2>

            <table className="workcation-form-table">
                <tbody>
                    {/**거점 유형 선택 */}
                    <tr>
                        <th style={{ width: "120px" }}>신청기간</th>
                        <td style={{ width: "px" }}>1</td>
                        <th style={{ width: "120px" }}>신청인원</th>
                        <td>
                            <textarea></textarea>
                        </td>
                    </tr>
                    <tr>
                        <th>근무 목적</th>
                        <td>1</td>
                        <th>지역</th>
                        <td>
                            <select className="">
                                <option value=""></option>
                            </select>
                            <select className="">
                                <option value=""></option>
                            </select>
                        </td>
                    </tr>
                    {/**거점 유형선택 */}
                    <tr>
                        <th>거점 유형</th>
                        <td colSpan={3}>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="placeType"
                                    value="office"
                                    checked={placeType === "office"}
                                    onChange={handleTypeChange} />
                                공유오피스
                            </label>
                            <label className="radio-btn">
                                <input type="radio"
                                    name="placeType"
                                    value="accommodation"
                                    checked={placeType === "accommodation"}
                                    onChange={handleTypeChange} />
                                숙소
                            </label>
                        </td>
                    </tr>

                    {/*선택된 유형 드롭다운 및 주소 */}
                    <tr>
                        <th>{placeType === "office" ? "오피스 선택" : "숙소 선택"}</th>
                        <td>
                            <select value={selectedPlaceId}
                                onChange={handlePlaceSelect}>
                                <option value="">
                                    {placeType === " office" ? "오피스를 선택하세요." : " 숙소를 선택하세요."}
                                </option>
                                {(placeType === "office" ? officeList : accommodationList).map((item) => (
                                    <option key={item.hubNo} value={item.hubNo}>
                                        {item.hubNo}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <th>위치 주소</th>
                        <td>{selectedAddress || "선택된 거점 없음"}</td>
                    </tr>

                    {/**showBtn에 따른 렌더딩 */}
                    {showBtn1 && (
                        <tr>
                            <th>체험 프로그램</th>
                            <td>
                                <select name="programNo">
                                    <option value="">프로그램 선택</option>
                                    <option value="10">준비중</option>
                                </select>
                            </td>
                            <th>예약일</th>
                            <td>
                                <input type="date" name="programDate" />
                                <button type="button"
                                        className="remove-btn"
                                        onClick={()=> setShowBtn1(false)}
                                        title="삭제">
                                    X
                                </button>
                            </td>
                        </tr>
                    )}

                    {showBtn2 && (
                        <tr>
                            <th>맛집</th>
                            <td>
                                <select name="programNo">
                                    <option value="">맛집 선택</option>
                                    <option value="10">준비중</option>
                                </select>
                            </td>
                            <th>방문일</th>
                            <td>
                                <input type="date" name="programDate" />
                                 <button type="button"
                                        className="remove-btn"
                                        onClick={()=> setShowBtn2(false)}
                                        title="삭제">
                                    X
                                </button>
                            </td>
                        </tr>
                    )}

                    {showBtn3 && (
                        <tr>
                            <th>관광지</th>
                            <td>
                                <select name="programNo">
                                    <option value="">관광지 선택</option>
                                    <option value="10">준비중</option>
                                </select>
                            </td>
                            <th>방문일</th>
                            <td>
                                <input type="date" name="programDate" />
                                 <button type="button"
                                        className="remove-btn"
                                        onClick={()=> setShowBtn3(false)}
                                        title="삭제">
                                    X
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/**하단 옵션추가 선택 영역 */}
            <div className="insert-option-btn-group">
                    {!showBtn1 && (
                        <button type="button"
                                onClick={()=> setShowBtn1(true)}>
                                    + 체험 프로그램
                                </button>
                    )}
                     {!showBtn2 && (
                        <button type="button"
                                onClick={()=> setShowBtn2(true)}>
                                    + 맛집
                                </button>
                    )}
                     {!showBtn3 && (
                        <button type="button"
                                onClick={()=> setShowBtn3(true)}>
                                    + 관광지
                                </button>
                    )}
            </div>

        </div>
    )
}
export default WorkcationEnrollFormComponent
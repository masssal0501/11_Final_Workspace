import React, { useState, useEffect } from "react";
import axios from "axios";

// 참고: 아래 두 호출은 원래부터 "/workflow" context-path와 "/hubs"(복수형)가 빠져 있어
// 로컬 개발 환경에서도 404가 나는 상태였던 것으로 보임(별도 버그, 이번 배포 작업 범위 밖).
// 여기서는 하드코딩된 개발용 host만 배포 환경에 맞게 주입 가능하도록 정리함.
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8006/workflow";

export const OPTION_CONFIG = {
    program: { label: "체험 프로그램", key: "program", priceKey: "programPrice", dateName: "programDate" },
    restaurant: { label: "맛집", key: "restaurant", priceKey: "restaurantPrice", dateName: "restaurantDate" },
    tour: { label: "관광지", key: "tour", priceKey: "tourPrice", dateName: "tourDate" }
};

function WorkcationItemComponent(props) {
    const { mainRegion, subRegion, onRegionChange } = props;

    const [mainRegionList, setMainRegionList] = useState([]);
    const [subRegionList, setSubRegionList] = useState([]);

    //메인 지역 목록 조회(강원, 부산, 제주)
    useEffect(() => {
        axios.get(`${API_BASE_URL}/hub/mainRegion`)
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : (res.data.list || []);
                setMainRegionList(res.data);
            })
            .catch(err => console.error("메인 지역 로딩 실패: ", err))
    }, []);

    //메인지역드롭이 바뀔 때마다 하위 상세지역 조회
    useEffect(() => {
        if (!mainRegion) {
            setSubRegionList([]);
            return;
        }
        axios.get(`${API_BASE_URL}/hub/subRegion?mainRegion=${mainRegion}`)
            .then(res => setSubRegionList(res.data))
            .catch(err => console.error("서브 지역 로딩 실패: ", err))
    }, [mainRegion])

    const handleMainRegionChange = (e) => {
        onRegionChange(e.target.value, "");
    };

    const handleSubRegionChange = (e) => {
        onRegionChange(mainRegion, e.target.value);
    }

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="drop-group">

                {/**지역명 드롭다운 */}
                <select className="main-region"
                    value={mainRegion}
                    onChange={handleMainRegionChange} >
                    <option value="">지역명</option>
                    {mainRegionList.map((main, index) => (
                        <option key={index} value={typeof main === 'string' ? main : main.mainRegion}>
                            {typeof main === 'string' ? main : main.mainRegion}
                        </option>))}
                </select>

                {/**상세지역명 드롭다운 */}
                <select
                    className="sub-region"
                    value={subRegion}
                    onChange={handleSubRegionChange}
                    disabled={!mainRegion}>
                    <option value="">상세 지역명</option>
                    {subRegionList.map((sub, index) => (
                        <option key={index} value={typeof sub === 'string' ? sub : sub.subRegion}>
                            {typeof sub === 'string' ? sub : sub.subRegion}
                        </option>))}
                </select>
            </div>
        </form >
    )
}




export default WorkcationItemComponent;
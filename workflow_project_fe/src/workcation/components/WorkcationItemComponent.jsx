import React, { useState, useEffect } from "react";
import axiosInstance from "../../common/api/axiosInstance";

// 참고: 아래 두 호출은 원래부터 "/hubs"(복수형)가 빠져 있어 로컬 개발 환경에서도
// 404가 나는 상태였던 것으로 보임(별도 버그, 이번 배포 작업 범위 밖 - 손대지 않음).
//
// BUG: 이 컴포넌트만 유일하게 공용 axiosInstance(../../common/api/axiosInstance) 대신
// raw axios + 수동 조립한 API_BASE_URL을 사용하고 있어서, axiosInstance에 등록된
// 401/403 응답 인터셉터(자동 로그아웃/에러 페이지 이동)가 이 두 요청에는 전혀
// 적용되지 않았다. axiosInstance로 교체해 인터셉터 커버리지를 맞춘다(엔드포인트
// 경로 자체의 404 버그는 위 주석대로 범위 밖이라 그대로 둠).

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
        axiosInstance.get(`/hub/mainRegion`)
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
        axiosInstance.get(`/hub/subRegion?mainRegion=${mainRegion}`)
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
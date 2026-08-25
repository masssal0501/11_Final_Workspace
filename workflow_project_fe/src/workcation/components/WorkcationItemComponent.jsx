import React, { useState } from "react";

export const WORKCATION_FULL_DATA = {
    "강원도": {
        "강릉시": {
            office: { 
                name: "솔올 스마트 워크스페이스", price: 25000, address: "강릉시 솔올로 45번길 12", 
                restaurant: "교동 초당장칼국수 (강릉시 솔올로 45번길 18)", restaurantPrice: 12000,
                tour: "경포호수 수변공원 전망대 (강릉시 경포로 365)", tourPrice: 5000,
                program: "강릉 전통 다도 및 다과 체험관 (강릉시 난설헌로 195번길 8)", programPrice: 25000
            },
            accommodation: { 
                name: "안목 오션뷰 스테이", price: 120000, address: "강릉시 창해로 307번길 15", 
                restaurant: "안목해변 섭국 전문점 (강릉시 창해로 307번길 22)", restaurantPrice: 15000,
                tour: "안목 커피거리 산책로 (강릉시 창해로 14번길 39)", tourPrice: 0,
                program: "안목 수제 로스팅 클래스 (강릉시 공항길 127번길 9)", programPrice: 35000
            }
        },
        "속초시": {
            office: { 
                name: "설악 스마트 밸리", price: 30000, address: "속초시 중앙로 123번길 10", 
                restaurant: "속초 아바이순대 (속초시 중앙로 123번길 16)", restaurantPrice: 14000,
                tour: "청초호 유원지 산책로 (속초시 청초호반로 88)", tourPrice: 3000,
                program: "속초 요트 항해 체험 (속초시 엑스포로 45)", programPrice: 50000
            },
            accommodation: { 
                name: "속초 해변 테라스 스테이", price: 95000, address: "속초시 해오름로 186", 
                restaurant: "속초 물회 마을 (속초시 해오름로 190)", restaurantPrice: 18000,
                tour: "속초해수욕장 둘레길 (속초시 해오름로 102)", tourPrice: 0,
                program: "서핑 입문 클래스 (속초시 샌드파인길 20)", programPrice: 60000
            }
        },
        "양양군": {
            office: { 
                name: "양양 코워킹 허브", price: 20000, address: "양양군 양양읍 군청길 25", 
                restaurant: "양양 섭국 전문점 (양양군 양양읍 군청길 31)", restaurantPrice: 13000,
                tour: "남대천 생태공원 (양양군 양양읍 남대천로 110)", tourPrice: 0,
                program: "목공예 공방 체험 (양양군 양양읍 구룡령로 520)", programPrice: 30000
            },
            accommodation: { 
                name: "인구해변 웨이브 하우스", price: 85000, address: "양양군 현남면 인구길 48", 
                restaurant: "죽도 수제버거 (양양군 현남면 인구길 54)", restaurantPrice: 16000,
                tour: "죽도 전망대 (양양군 현남면 죽도정길 12)", tourPrice: 2000,
                program: "인구해변 서핑 아카데미 (양양군 현남면 동산항길 15)", programPrice: 65000
            }
        },
        "춘천시": {
            office: { 
                name: "춘천 혁신 워크스페이스", price: 22000, address: "춘천시 중앙로 87", 
                restaurant: "명동 닭갈비 골목 (춘천시 중앙로 93)", restaurantPrice: 15000,
                tour: "공지천 조각공원 (춘천시 공지천로 250)", tourPrice: 0,
                program: "춘천 물길 카누 카약 체험 (춘천시 카누길 30)", programPrice: 30000
            },
            accommodation: { 
                name: "소양강 레이크뷰 스테이", price: 78000, address: "춘천시 소양강로 142", 
                restaurant: "소양강 막국수 (춘천시 소양강로 150)", restaurantPrice: 10000,
                tour: "소양강 스카이워크 (춘천시 소양강로 200)", tourPrice: 2000,
                program: "전통 막국수 만들기 (춘천시 신북읍 신샘밭로 612)", programPrice: 20000
            }
        },
        "평창군": {
            office: { 
                name: "평창 그린 비즈니스 센터", price: 18000, address: "평창군 평창읍 올림픽로 45", 
                restaurant: "평창 메밀막국수 (평창군 평창읍 올림픽로 51)", restaurantPrice: 11000,
                tour: "대관령 바람길 (평창군 대관령면 대관령마루길 120)", tourPrice: 5000,
                program: "치즈 만들기 체험장 (평창군 대관령면 대관령로 300)", programPrice: 22000
            },
            accommodation: { 
                name: "알펜 하이츠 스테이", price: 110000, address: "평창군 대관령면 눈마을길 32", 
                restaurant: "대관령 한우 마을 (평창군 대관령면 눈마을길 40)", restaurantPrice: 45000,
                tour: "하늘목장 산책로 (평창군 대관령면 대관령로 510)", tourPrice: 8000,
                program: "오대산 숲 명상 리트릿 (평창군 진부면 오대산로 152)", programPrice: 40000
            }
        }
    },
    "부산": {
        "해운대구": {
            office: { 
                name: "센텀 스마트 공유오피스", price: 35000, address: "해운대구 센텀서로 30", 
                restaurant: "센텀 가야밀면 (해운대구 센텀서로 38)", restaurantPrice: 10000,
                tour: "영화의전당 야외광장 (해운대구 벡스코로 55)", tourPrice: 0,
                program: "VR 미디어 아트 체험관 (해운대구 센텀중앙로 78)", programPrice: 18000
            },
            accommodation: { 
                name: "마린 오션뷰 레지던스", price: 165000, address: "해운대구 해운대해변로 265번길 12", 
                restaurant: "해운대 암소갈비 (해운대구 해운대해변로 265번길 20)", restaurantPrice: 52000,
                tour: "해운대 해변열차 탑승장 (해운대구 달맞이길 62번길 11)", tourPrice: 12000,
                program: "요트 투어 및 썬셋 크루즈 (해운대구 미포길 45)", programPrice: 70000
            }
        },
        "영도구": {
            office: { 
                name: "영도 워터프론트 워크스페이스", price: 28000, address: "영도구 봉래나루로 82", 
                restaurant: "영도 제주복국 (영도구 봉래나루로 90)", restaurantPrice: 18000,
                tour: "영도대교 도개 전망대 (영도구 대교로 14)", tourPrice: 0,
                program: "커피 로스팅 아카데미 (영도구 해양로 201)", programPrice: 25000
            },
            accommodation: { 
                name: "흰여울 라비에 스테이", price: 90000, address: "영도구 절영로 210", 
                restaurant: "흰여울 해녀촌 (영도구 절영로 218)", restaurantPrice: 20000,
                tour: "흰여울문화마을 산책로 (영도구 절영로 190)", tourPrice: 0,
                program: "태종대 다누비 체험 (영도구 태종로 835)", programPrice: 10000
            }
        },
        "수영구": {
            office: { 
                name: "광안리 웍스 라운지", price: 30000, address: "수영구 광남로 112", 
                restaurant: "민락 언양불고기 (수영구 광남로 120)", restaurantPrice: 32000,
                tour: "민락수변공원 전망대 (수영구 민락수변로 95)", tourPrice: 0,
                program: "SUP 패들보드 클래스 (수영구 광안해변로 225)", programPrice: 45000
            },
            accommodation: { 
                name: "광안 드림 오션 스테이", price: 135000, address: "수영구 광안해변로 197", 
                restaurant: "광안리 회센터 (수영구 광안해변로 203)", restaurantPrice: 40000,
                tour: "광안리 드론쇼 관람존 (수영구 광안해변로 219)", tourPrice: 0,
                program: "칵테일 메이킹 클래스 (수영구 광안해변로 250)", programPrice: 35000
            }
        },
        "부산진구": {
            office: { 
                name: "전포 테크 웍스", price: 25000, address: "부산진구 전포대로 209", 
                restaurant: "전포 카페거리 수제파스타 (부산진구 전포대로 215)", restaurantPrice: 17000,
                tour: "서면 메디컬&쇼핑 스트리트 (부산진구 서면로 56)", tourPrice: 0,
                program: "퍼스널 컬러 메이크업 클래스 (부산진구 동천로 85)", programPrice: 50000
            },
            accommodation: { 
                name: "서면 부티크 레지던스", price: 80000, address: "부산진구 중앙대로 680", 
                restaurant: "서면 돼지국밥 (부산진구 중앙대로 686)", restaurantPrice: 9500,
                tour: "송상현광장 산책로 (부산진구 가야대로 772)", tourPrice: 0,
                program: "가죽 공예 디자이너 원데이 (부산진구 전포대로 176)", programPrice: 40000
            }
        },
        "중구": {
            office: { 
                name: "남포 비즈니스 허브", price: 22000, address: "중구 중앙대로 26", 
                restaurant: "남포동 완당집 (중구 중앙대로 32)", restaurantPrice: 10000,
                tour: "부산타워 전망대 (중구 용두산길 37)", tourPrice: 12000,
                program: "자갈치 시장 수산물 요리 교실 (중구 자갈치해안로 52)", programPrice: 30000
            },
            accommodation: { 
                name: "자갈치 뷰 스테이", price: 75000, address: "중구 자갈치로 42", 
                restaurant: "자갈치 꼼장어 구이 (중구 자갈치로 48)", restaurantPrice: 25000,
                tour: "국제시장 꽃분이네 거리 (중구 국제시장2길 15)", tourPrice: 0,
                program: "레트로 흑백 사진 촬영 체험 (중구 대청로 116)", programPrice: 20000
            }
        }
    },
    "제주도": {
        "서귀포시": {
            office: { 
                name: "중문 디지털 노마드 라운지", price: 32000, address: "서귀포시 중문관광로 72번길 15", 
                restaurant: "중문 흑돼지 구이 (서귀포시 중문관광로 72번길 21)", restaurantPrice: 30000,
                tour: "주상절리대 산책로 (서귀포시 중문관광로 224)", tourPrice: 2000,
                program: "서귀포 스쿠버다이빙 체험 (서귀포시 태평로 353)", programPrice: 80000
            },
            accommodation: { 
                name: "이중섭거리 감성 스테이", price: 140000, address: "서귀포시 이중섭로 22", 
                restaurant: "서귀포 올레시장 모둠회 (서귀포시 이중섭로 28)", restaurantPrice: 35000,
                tour: "천지연폭포 산책로 (서귀포시 천지연로 91)", tourPrice: 2000,
                program: "제주 감귤 따기 체험장 (서귀포시 칠십리로 115)", programPrice: 15000
            }
        },
        "제주시": {
            office: { 
                name: "제주 IT 크리에이티브 스페이스", price: 30000, address: "제주시 첨단로 242", 
                restaurant: "아라동 고기국수 (제주시 첨단로 250)", restaurantPrice: 10000,
                tour: "애월 한담해안산책로 (제주시 애월읍 애월해안로 512)", tourPrice: 0,
                program: "투명 카약 체험 (제주시 애월읍 애월해안로 520)", programPrice: 25000
            },
            accommodation: { 
                name: "세화 오션 스테이", price: 125000, address: "제주시 구좌읍 해맞이해안로 1120", 
                restaurant: "구좌 전복죽 (제주시 구좌읍 해맞이해안로 1128)", restaurantPrice: 16000,
                tour: "평대리 해변 수변공원 (제주시 구좌읍 평대리 1200)", tourPrice: 0,
                program: "비자림 힐링 도슨트 투어 (제주시 구좌읍 비자숲길 55)", programPrice: 12000
            }
        }
    }
};

export const OPTION_CONFIG = {
    program: { label: "체험 프로그램", key: "program", priceKey: "programPrice", dateName: "programDate" },
    restaurant: { label: "맛집", key: "restaurant", priceKey: "restaurantPrice", dateName: "restaurantDate" },
    tour: { label: "관광지", key: "tour", priceKey: "tourPrice", dateName: "tourDate" }
};

function WorkcationItemComponent({ mainRegion, subRegion, onRegionChcange }) {

    const handleMainRegionChange = (e) => {
        onRegionChcange(e.target.value, "");
    };

    const handleSubRegionChange = (e) => {
        onRegionChcange(mainRegion, e.target.value);
    }

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="drop-group">

                {/**지역명 드롭다운 */}
                <select className="main-region"
                    value={mainRegion}
                    onChange={handleMainRegionChange} >
                    <option value="">지역명</option>
                    {Object.keys(WORKCATION_FULL_DATA).map((main) => (
                        <option key={main} value={main}>
                            {main}
                        </option>))}
                </select>

                {/**상세지역명 드롭다운 */}
                <select
                    className="sub-region"
                    value={subRegion}
                    onChange={handleSubRegionChange}
                    disabled={!mainRegion}>
                    <option value="">상세 지역명</option>
                    {mainRegion && Object.keys(WORKCATION_FULL_DATA[mainRegion] || {}).map((sub) => (
                        <option key={sub} value={sub}>
                            {sub}
                        </option>))}
                </select>
            </div>
        </form >
    )
}




export default WorkcationItemComponent;
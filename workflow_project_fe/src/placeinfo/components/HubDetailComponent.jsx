import { useNavigate, useParams } from 'react-router-dom';

import { useEffect, useRef, useState } from 'react';

import "../styles/HubDetailComponent.css";

import { selectHubApi } from "../api/placeinfoApi";

function HubDetailComponent() {
    
    // 실행할 구문
    // 카카오 API JavaScript 키
    const KAKAO_API_KEY = 'a00510cb26a4e33be1647f26b12df5c9';
    const mapContainerRef = useRef(null);
    const { kakao } = window;
    const address = "제주특별자치도 서귀포시 중문관광로72번길 35 8층";
    const hubNo = useParams().hubNo;

    let navigate = useNavigate();

    const [hub, setHub] = useState({hubNo : "",
                                    hubName : "",
                                    phone : "",
                                    price : "",
                                    hubState : "",
                                    hubType : "",
                                    address : "",
                                    description : "",
                                    mainRegion : "",
                                    subRegion : ""});

    useEffect(() =>{

        const selectBoard = async () => {

            try {

                const response = await selectHubApi(hubNo);

                if(response.data != "") {

                    setHub(response.data);

                } else {

                    alert("이미 삭제되었거나 없는 거점입니다.");

                    navigate("/placeInto/list")
                }

            } catch(error) {
                console.log("거점 상세조회용 ajax 오류");
            }
        }

        selectBoard();

    }, []);

    useEffect(() => {
        // 일반 지도 생성 함수
        const initMap = () => {

            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result, status) => {
                // 표시할 위치 좌표 (제주 카카오 본사 좌표 예시)
                const markerPosition = new kakao.maps.LatLng(result[0].y, result[0].x);
                console.log(result);
                const mapOption = {
                    center: markerPosition, // 지도 중심 좌표
                    level: 3 // 지도 확대/축소 레벨
                };

                // 1. 지도 객체 생성
                const map = new kakao.maps.Map(mapContainerRef.current, mapOption);

                // 2. 마커 생성 및 지도 위에 표시
                const marker = new kakao.maps.Marker({
                    position: markerPosition
                });
                marker.setMap(map);

                const infowindow = new kakao.maps.InfoWindow({
                    content: `<div style="width:150px;font-size:12px;text-align:center;padding:6px 0;">디어먼데이 제주 롯데호텔점</div>`
                });
                infowindow.open(map, marker);
            });
        };

        // 1. 이미 SDK가 로드되어 있다면 지도 생성
        if (kakao && kakao.maps && window.kakao.maps.services) {
            kakao.maps.load(initMap);
            return;
        }

        // 2. 스크립트 동적 로드
        let script = document.getElementById('kakao-map-script');
        if (!script) {
            script = document.createElement('script');
            script.id = 'kakao-map-script';
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;
            script.async = true;

            script.onload = () => {
                kakao.maps.load(initMap);
            };

            document.head.appendChild(script);
        } else {
            script.addEventListener('load', () => {
                kakao.maps.load(initMap);
            });
        }
    }, [KAKAO_API_KEY]);

    const handleCopyClipBoard = async () => {
        try {
            await navigator.clipboard.writeText(address);
            alert('클립보드에 링크가 복사되었습니다.');
        } catch (error) {
            alert('복사에 실패하였습니다');
        }
    };

    return (
        <div className="content">
            <h2 align="center"><b>디어먼데이 제주 롯데호텔점</b></h2>
            <br /><br />
            <div className="title-area area">
                <img 
                    src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260107_162%2F1767772273655wAbv4_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25C3%25E1%25C3%25B5_%25B3%25B2%25C0%25BC%25B6_%25C1%25A4%25B0%25FC%25B7%25E7_%25C0%25FC%25B0%25E6.jpg" 
                    alt="이미지" 
                />
                <div className="span-area">
                    <span>거점명 : 디어먼데이 제주 롯데호텔점</span>
                    <span>전화번호 : 0507-1234-5678</span>
                    <span>1박 가격 : 100,000원 </span>
                    <span>운영 상태 : 운영중</span>
                    <span>최대 수용 인원 : 10명</span>
                    <span>유형 : 숙소</span>
                </div>
            </div>
            <br />
            <hr />
            <br />
            <div className="content-area area">
                {/* 일반 지도가 렌더링되는 영역 */}
                <div className="span-area big-font">
                    <span style={ { fontSize: "19px" } }>주소 : 제주특별자치도 서귀포시 중문관광로72번길 35 8층<br/><p onClick={ handleCopyClipBoard }>※복사하기</p></span>
                    <span style={ { fontSize: "26px" } }>평균 별점 : ☆☆☆☆☆ (0.0)</span>
                </div>
                <div id="map" ref={mapContainerRef} />
            </div>
            <br />
            <hr />
            <br />
            <div>
                <p align="center" style={ { fontSize : "20px" } }>
                    [운영시간]<br />
                    24시<br /><br />
                    [시설 안내]<br />
                    하이엔드 사무의자 12개 (허먼밀러, 해워스), 모니터 12개, HDMI 케이블 12개, HDMI to C Type 젠더 12개, 복합기 (프린트, 스캔, 복사), 와이파이, 8인용 회의실, 회의용 TV 모니터, 화이트보드
                </p>
            </div>
            <br />
            <hr />
            <br />
            <div className="img-area area">
                <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260210_263%2F1770702571844LRBc9_PNG%2F%25B3%25D7%25C0%25CC%25B9%25F6_%25C7%25C3%25B7%25B9%25C0%25CC%25BD%25BA_%25BD%25E6%25B3%25D7%25C0%25CF_%25BC%25D2%25B3%25EB%25C4%25AF_%25C1%25A6%25C1%25D6.png" alt="첨부이미지1" />
                <img src="https://search.pstatic.net/common/?src=https%3A%2F%2Fldb-phinf.pstatic.net%2F20260210_214%2F1770702623664dXITW_JPEG%2F%25B5%25F0%25BE%25EE%25B8%25D5%25B5%25A5%25C0%25CC_%25BC%25D2%25B3%25EB%25C4%25AF%25C1%25A6%25C1%25D6%25C1%25A1_%25BF%25C0%25C7%25C7%25BD%25BA_8.jpg" alt="첨부이미지2" />
            </div>
        </div>
    );
}

export default HubDetailComponent;
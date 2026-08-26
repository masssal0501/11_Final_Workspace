import { useNavigate, useParams } from 'react-router-dom';

import { useEffect, useRef, useState } from 'react';

import "../styles/HubDetailComponent.css";

import { selectHubApi, deleteHubApi, BASE_URL } from "../api/placeinfoApi";

function HubDetailComponent() {
    
    // 실행할 구문
    // 카카오 API JavaScript 키
    const KAKAO_API_KEY = 'a00510cb26a4e33be1647f26b12df5c9';
    const mapContainerRef = useRef(null);
    const { kakao } = window;
    const hubNo = useParams().hubNo;

    let navigate = useNavigate();

    const [hub, setHub] = useState({hubNo : hubNo,
                                    hubName : "",
                                    phone : "",
                                    price : 0,
                                    hubStatus : "",
                                    hubType : 0,
                                    hubAddress : "",
                                    description : "",
                                    mainRegion : "",
                                    subRegion : "",
                                    maxCapacity : 0,
                                    hubFileList : [{
                                        filePath : "",
                                        changeName : ""
                                    }]});
    const [avgScore, setAvgScore] = useState(""); 
                                    
    useEffect(() =>{

        const selectBoard = async () => {

            try {

                const response = await selectHubApi(hubNo);

                if(response.data != "") {

                    setHub(response.data.hub);
                    setAvgScore(response.data.avgScore);

                } else {

                    alert("이미 삭제되었거나 없는 거점입니다.");

                    navigate("/placeInfo/list")
                }

            } catch(error) {
                console.log("거점 상세조회용 ajax 오류");
            }
        }

        selectBoard();

    }, [hubNo]);
    
    useEffect(() => {
        // 백엔드에서 주소 데이터를 아직 못 가져왔다면 지도를 그리지 않고 대기
        if (!hub.hubAddress) return;

        // 일반 지도 생성 함수
        const initMap = () => {
            
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(hub.hubAddress, (result, status) => {
                // 표시할 위치 좌표 (제주 카카오 본사 좌표 예시)
                const markerPosition = new kakao.maps.LatLng(result[0].y, result[0].x);

                const mapOption = {
                    center: markerPosition, // 지도 중심 좌표
                    level: 3 // 지도 확대/축소 레벨
                };

                // 지도 객체 생성
                const map = new kakao.maps.Map(mapContainerRef.current, mapOption);

                // 마커 생성 및 지도 위에 표시
                const marker = new kakao.maps.Marker({
                    position: markerPosition
                });
                marker.setMap(map);

                const infowindow = new kakao.maps.InfoWindow({
                    content: `<div style="width:150px;font-size:12px;text-align:center;padding:6px 0;">${ hub.hubName }</div>`
                });
                infowindow.open(map, marker);
            });
        };

        // 이미 SDK가 로드되어 있다면 지도 생성
        if (kakao && kakao.maps && window.kakao.maps.services) {
            kakao.maps.load(initMap);
            return;
        }

        // 스크립트 동적 로드
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
    }, [hub.hubAddress]);

    const handleCopyClipBoard = async () => {
        try {
            await navigator.clipboard.writeText(hub.hubAddress);
            alert('클립보드에 링크가 복사되었습니다.');
        } catch (error) {
            alert('복사에 실패하였습니다');
        }
    };

    const deleteHub = async e => {

        if(confirm("중단하면 더이상 수정이 불가능합니다.\n정말 해당 거점을 중단하시겠습니까?")) {
            
            e.preventDefault();

            try {

                const response = await deleteHubApi(hubNo);

                console.log(response);

                if(response.data === "success") {
                    alert("거점 종료에 성공했습니다.");
                    navigate("/placeInfo/list"); // 성공 시 리스트 페이지로 이동
                } else {
                    alert("거점 종료에 실패했습니다.");
                }

            } catch(error) {
                console.log("거점 종료용 ajax 통신 실패");
            }
        }

    }

    return (
        <div className={ `content ${(hub.hubStatus === 'CLOSED') ? "content-off" : ""}` }>
            <h2 align="center"><b>{ hub.hubName }</b></h2>
            <br /><br />
            <div className="title-area area">
                <img src={`${BASE_URL.replace('/hubs', '')}${hub.hubFileList[0].filePath}/${hub.hubFileList[0].changeName}`} />
                <div className="span-area">
                    <span>거점명 : { hub.hubName }</span>
                    <span>전화번호 : { hub.phone }</span>
                    <span>1박 가격 : { hub.price.toLocaleString('ko-KR') }원 </span>
                    <span>운영 상태 : { (hub.hubStatus === "OPEN") ? (<b style={{color:'green'}}>운영중</b>) : ((hub.hubStatus === "PAUSED") ? (<b style={{color:'yellow'}}>일시중단</b>) : (<b style={{color:'red'}}>중단</b>)) }</span>
                    <span>최대 수용 인원 : { hub.maxCapacity }명</span>
                    <span>유형 : { (hub.hubType === 1) ? "숙소" : "공유 오피스" }</span>
                </div>
            </div>
            <br />
            <hr />
            <br />
            <div className="content-area area">
                {/* 일반 지도가 렌더링되는 영역 */}
                <div className="span-area big-font">
                    <span style={ { fontSize: "19px" } }>주소 : { hub.hubAddress }<br/><p onClick={ handleCopyClipBoard }>※복사하기</p></span>
                    <span style={ { fontSize: "26px" } }>평균 별점 : { (avgScore === 5) ? "★★★★★" : (
                                                                       (avgScore >= 4) ? "★★★★☆" : (
                                                                       (avgScore >= 3) ? "★★★☆☆" : (
                                                                       (avgScore >= 2) ? "★★☆☆☆" : (
                                                                       (avgScore >= 1) ? "★☆☆☆☆" : 
                                                                                             "☆☆☆☆☆"))))} ({ avgScore })</span>
                </div>
                <div id="map" ref={mapContainerRef} />
            </div>
            <br />
            <hr />
            <br />
            <div>
                <p align="center" style={ { fontSize : "20px" } }>
                    { hub.description }
                </p>
            </div>
            
            { (hub.hubFileList.length > 1) ? (
                <>
                    <br />
                    <hr />
                    <br />
                    <div className="img-area area">
                    {/* hubFileList가 존재할 때만 실행되며, 0번(썸네일)을 제외한 나머지 이미지들만 반복해서 그려줍니다. */}
                        {hub.hubFileList && hub.hubFileList.slice(1).map((file, index) => (
                            <img 
                                key={index} 
                                src={`${BASE_URL.replace('/hubs', '')}${file.filePath}/${file.changeName}`} 
                                alt={`첨부이미지${index + 1}`} 
                            />
                        ))}
                    </div>
                </>
            ) : ""}
            <br /><br />
            <div className='button-area'>
                { (hub.hubStatus === "CLOSED") ? "" : (
                    <>
                        <button className='btn btn-warning' onClick={ () => { navigate(`/placeInfo/updateForm/${hubNo}`) } }>수정하기</button>&nbsp;
                        <button className='btn btn-danger' onClick={ deleteHub }>중단하기</button>
                    </>
                )}
                <button className='btn btn-dark' onClick={ () => { navigate(-1) } }>뒤로가기</button>
            </div>
        </div>
    );
}

export default HubDetailComponent;
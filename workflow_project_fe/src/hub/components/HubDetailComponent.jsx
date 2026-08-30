import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"
import "../styles/Hub.css";
import { selectHubApi, deleteHubApi, BASE_URL } from "../api/hubApi";

function HubDetailComponent(props) {
    
    // d변환된 좌표를 저장할 State
    const [position, setPosition] = useState(null);
    // React Router의 useParams를 통해 URL 경로 파라미터에서 hubNo 추출
    const hubNo = useParams().hubNo;
    // 페이지 이동을 제어하는 React Router 훅
    const navigate = useNavigate();
    // Kakao API 사용을 위한 window 객체 참조
    const { kakao } = window;
    // 카카오 SDK 로더
    const [loading, error] = useKakaoLoader({
        appkey: 'a00510cb26a4e33be1647f26b12df5c9',
        libraries: ['services'], // 주소 변환을 위해 필수
    });

    // 거점 상세 정보 폼 데이터를 관리하는 통합 객체 State
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
                                    hubFileList : []});
    // 해당 거점의 평균 별점 데이터를 관리
    const [avgScore, setAvgScore] = useState(""); 

    // 로그인한 사용자 정보 불러오기
    const loginUser = props.loginUser;
    // 컴포넌트 마운트 시 또는 hubNo가 변경될 때 해당 거점의 기존 정보를 서버에서 조회
    useEffect(() =>{
        // 비동기 API 호출: 거점 상세 정보 조회
        const selectBoard = async () => {
            try {
                const response = await selectHubApi(hubNo);
                // 조회 결과 데이터가 존재하는 경우
                if(response.data != "") {
                    setHub(response.data.hub);
                    setAvgScore(response.data.avgScore);
                } else {
                    // 데이터가 없는 경우 경고창 띄우고 목록으로 리다이렉트
                    alert("이미 삭제되었거나 없는 거점입니다.");
                    navigate("/placeInfo/list")
                }
            } catch(error) {
                console.error(error);
            }
        }
        selectBoard();
    }, [hubNo]);

    // 주소를 좌표로 변환
    useEffect(() => {
        // 백엔드에서 주소 데이터를 아직 못 가져왔다면 지도를 그리지 않고 대기
        if (!loading && hub.hubAddress) {
            // 주소로 좌표를 검색하여 지도 및 마커 세팅
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(hub.hubAddress, (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    // 표시할 위치 좌표
                    setPosition({ lat: result[0].y, lng: result[0].x });
                }
            });
        }
    }, [loading, hub.hubAddress]);

    // 거점 주소를 클립보드에 복사하는 기능
    const handleCopyClipBoard = async () => {
        try {
            await navigator.clipboard.writeText(hub.hubAddress);
            alert('클립보드에 링크가 복사되었습니다.');
        } catch (error) {
            console.error(error);
        }
    };

    // 거점 운영을 중단하는 기능
    const deleteHub = async e => {

        if(confirm("중단하면 더이상 수정이 불가능합니다.\n정말 해당 거점을 중단하시겠습니까?")) {
            
            e.preventDefault();

            try {

                const response = await deleteHubApi(hubNo);

                console.log(response);

                if(response.data === "success") {
                    alert("거점 중단에 성공했습니다.");
                    navigate("/hub/list"); // 성공 시 리스트 페이지로 이동
                } else {
                    alert("거점 중단에 실패했습니다.");
                }

            } catch(error) {
                console.error(error);
            }
        }

    }

    // return 구문
    return (
        <div className={ `content ${hub.hubStatus === 'CLOSED' && 'content-off'}` }>
            {/* 거점명 출력 */}
            <h2 align="center"><b>{ hub.hubName }</b></h2>
            <br /><br />
            {/* 썸네일 이미지와 기본 정보 */}
            <div className="title-area area">
                {hub.hubFileList && hub.hubFileList.length > 0 && (
                    <img src={`${BASE_URL.replace('/hubs', '')}${hub.hubFileList[0].filePath}/${hub.hubFileList[0].changeName}`} alt="썸네일 이미지" />
                )}
                <div className="span-area">
                    <span>거점명 : { hub.hubName }</span>
                    <span>전화번호 : { hub.phone }</span>
                    <span>1{ (hub.hubType === 1) ? "박" : "일" } 가격 : { hub.price.toLocaleString('ko-KR') }원 </span>
                    <span>운영 상태 : { (hub.hubStatus === "OPEN") ? (<b style={{color:'green'}}>운영중</b>) : ((hub.hubStatus === "PAUSED") ? (<b style={{color:'yellow'}}>일시중단</b>) : (<b style={{color:'red'}}>중단</b>)) }</span>
                    <span>최대 수용 인원 : { hub.maxCapacity }명</span>
                    <span>유형 : { (hub.hubType === 1) ? "숙소" : "공유 오피스" }</span>
                </div>
            </div>
            <br />
            <hr />
            <br />
            {/* 클립보드 복사 버튼, 별점 렌더링, 카카오 맵 컨테이너 */}
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
                {/* 라이브러리 컴포넌트를 사용하여 지도 및 마커 렌더링 */}
                {position && (
                    <Map
                        center={position} 
                        style={{ width: "50%", height: "300px", border: "1px solid gray" }}
                        level={3}
                    >
                        <MapMarker position={position}>
                            <div style={{ width:"150px", fontSize:"12px", textAlign:"center", padding:"6px 0" }}>
                                {hub.hubName}
                            </div>
                        </MapMarker>
                    </Map>
                )}
            </div>
            <br />
            <hr />
            <br />
            {/* 거점에 대한 상세 텍스트 정보 */}
            <div>
                <p align="center" style={ { fontSize : "20px" } }>
                    { hub.description }
                </p>
            </div>
            
            {/* 썸네일을 제외한 나머지 이미지들을 순회하여 렌더링 */}
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
            {/* 상태에 따른 수정/중단 버튼 및 공통 뒤로가기 버튼 */}
            <div className='button-area'>
                { (hub.hubStatus === "CLOSED" || loginUser.authCode !== "ADMIN") ? "" : (
                    <>
                        <button className='btn btn-warning' onClick={ () => { navigate(`/hub/updateForm/${hubNo}`) } }>수정하기</button>&nbsp;
                        <button className='btn btn-danger' onClick={ deleteHub }>중단하기</button>
                    </>
                )}
                <button className='btn btn-dark' onClick={ () => { navigate(-1) } }>뒤로가기</button>
            </div>
        </div>
    );
}

export default HubDetailComponent;
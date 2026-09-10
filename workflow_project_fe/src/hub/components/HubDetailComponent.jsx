import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Map, MapMarker } from "react-kakao-maps-sdk"
import "../styles/Hub.css";
import { selectHubApi, deleteHubApi, BASE_URL } from "../api/hubApi";

/**
 * 거점(Hub) 상세 정보 조회 컴포넌트
 * 선택된 거점의 세부 정보, 지도 위치, 이미지, 평점 등을 렌더링하며 
 * 관리자 권한 시 수정/삭제 기능을 제공합니다.
 */
function HubDetailComponent(props) {
    
    // URL 경로 파라미터에서 거점 번호 추출
    const hubNo = useParams().hubNo;
    const navigate = useNavigate();

    // 주소 → 좌표 변환을 완료한 위도/경도 저장 State
    const [position, setPosition] = useState(null);

    // 거점 상세 정보 State (초기값 세팅)
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
    // 해당 거점의 평균 별점 State
    const [avgScore, setAvgScore] = useState(""); 

    // 로그인한 사용자 정보 (권한 확인용)
    const loginUser = props.loginUser;

    /**
     * 거점 상세 정보 서버 데이터 패칭 (마운트 및 hubNo 변경 시 동작)
     */
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
                    // 데이터가 없거나 삭제된 경우 경고 후 목록으로 강제 이동
                    alert("이미 삭제되었거나 없는 거점입니다.");
                    navigate("/hub/list")
                }
            } catch(error) {
                console.error(error);
            }
        }
        selectBoard();
    }, [hubNo]);

    /**
     * 주소 데이터를 기반으로 카카오맵 좌표(위경도) 변환 처리
     */
    useEffect(() => {
        if (!hub.hubAddress) return;
        // 주소 데이터가 로드된 이후에만 좌표 변환 수행
        const executeAddressSearch = () => {
            const { kakao } = window;
            if (!kakao?.maps) return false;
            kakao.maps.load(() => {
                if (!kakao.maps.services) {
                    console.error("카카오 지도 services 라이브러리가 로드되지 않았습니다.");
                    return;
                }

                if (kakao.maps.services) {
                    const geocoder = new kakao.maps.services.Geocoder();
                    
                    geocoder.addressSearch(hub.hubAddress, (result, status) => {
                        if (status === kakao.maps.services.Status.OK) {
                            // 변환 성공 시 마커를 띄울 위치 좌표 지정
                            setPosition({ lat: result[0].y, lng: result[0].x });
                        }
                    });
                }
            });
            return true;
        };

        // 이미 로드된 경우 즉시 실행
        if (executeAddressSearch()) return;

        // 아직 로드되지 않은 경우 100ms 간격으로 확인하여 로드 완료 시 실행
        const timer = setInterval(() => {
            if (executeAddressSearch()) {
                clearInterval(timer);
            }
        }, 100);

        return () => clearInterval(timer);
    }, [hub.hubAddress]);

    /**
     * 거점 주소 클립보드 복사 핸들러
     */
    const handleCopyClipBoard = () => {
        if (!hub.hubAddress) return;

        const textarea = document.createElement("textarea");
        textarea.value = hub.hubAddress;
        textarea.style.position = "fixed"; 
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert('클립보드에 주소가 복사되었습니다.');
            } else {
                alert('복사에 실패했습니다.');
            }
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
            alert('이 브라우저는 복사 기능을 지원하지 않습니다.');
        }
        
        document.body.removeChild(textarea);
    };

    /**
     * 거점 운영 중단(삭제) 핸들러
     */
    const deleteHub = async e => {

        if(confirm("중단하면 더이상 수정이 불가능합니다.\n정말 해당 거점을 중단하시겠습니까?")) {
            
            e.preventDefault();

            try {

                const response = await deleteHubApi(hubNo);

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

    /**
     * 카카오맵 길찾기 외부 링크 열기 핸들러
     */
    const goToKakaoMap = () => {
        if (!position) return;

        // HTTP 환경(비보안 환경)이거나 위치 정보를 지원하지 않는 경우,
        // 브라우저 팝업 차단 및 위치 API 제한을 피하기 위해 즉시 목적지 카카오맵 창을 엽니다.
        if (!window.isSecureContext || !navigator.geolocation) {
            window.open(`https://map.kakao.com/link/to/${hub.hubName},${position.lat},${position.lng}`);
            return;
        }

        // HTTPS 환경일 때만 현재 위치 기반 길찾기 시도
        navigator.geolocation.getCurrentPosition(
            (data) => {
                const { kakao } = window;
                if (kakao && kakao.maps && kakao.maps.services) {
                    const geocoder = new kakao.maps.services.Geocoder();
                    geocoder.coord2Address(data.coords.longitude, data.coords.latitude, (result, status) => {
                        if (status === kakao.maps.services.Status.OK && result[0]) {
                            const addressName = result[0].address.address_name;
                            window.open(`https://map.kakao.com/link/from/${addressName},${data.coords.latitude},${data.coords.longitude}/to/${hub.hubName},${position.lat},${position.lng}`);
                        } else {
                            window.open(`https://map.kakao.com/link/to/${hub.hubName},${position.lat},${position.lng}`);
                        }
                    });
                } else {
                    window.open(`https://map.kakao.com/link/to/${hub.hubName},${position.lat},${position.lng}`);
                }
            },
            (error) => {
                console.warn(error);
                window.open(`https://map.kakao.com/link/to/${hub.hubName},${position.lat},${position.lng}`);
            },
            { timeout: 5000 }
        );
    }

    // return 구문
    return (
        <main className="wf-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">{ hub.hubName || '거점 상세' }</h1>
                    <p className="wf-page-description">거점의 상세 정보와 위치, 평점을 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            {/* 중단(CLOSED) 상태일 경우 CSS를 통해 비활성화 디자인(content-off) 적용 */}
            <div className={ `hub-content ${hub.hubStatus === 'CLOSED' && 'content-off'}` }>

            {/* 썸네일 이미지와 기본 정보 */}
            <div className="title-area d-flex">
                {/* 첫 번째 첨부파일(썸네일) 렌더링 */}
                {hub.hubFileList && hub.hubFileList.length > 0 && (
                    <img src={`${BASE_URL.replace('/hubs', '')}${hub.hubFileList[0].filePath}/${hub.hubFileList[0].changeName}`} alt="썸네일 이미지" />
                )}

                <div className="span-area">
                    <span>거점명 : { hub.hubName }</span>
                    <span>전화번호 : { hub.phone }</span>
                    <span>1{ (hub.hubType === 1) ? "박" : "일" } 가격 : { hub.price.toLocaleString('ko-KR') }원 </span>
                    <span>운영 상태 : { (hub.hubStatus === "OPEN") ? (<span className="wf-badge wf-badge-success">운영중</span>) : ((hub.hubStatus === "PAUSED") ? (<span className="wf-badge wf-badge-warning">일시중단</span>) : (<span className="wf-badge wf-badge-danger">중단</span>)) }</span>
                    <span>최대 수용 인원 : { hub.maxCapacity }명</span>
                    <span>유형 : { (hub.hubType === 1) ? "숙소" : "공유 오피스" }</span>
                </div>
            </div>
            <br /><hr /><br />
            {/* 2. 상세 정보 및 카카오맵 지도 영역 */}
            <div className="content-area d-flex">
                {/* 주소, 평점, 길찾기 버튼 */}
                <div className="span-area big-font">
                    <span style={ { fontSize: "19px" } }>주소 : { hub.hubAddress }<br/><p onClick={ handleCopyClipBoard }>※복사하기</p></span>
                    <span><button className="btn btn-outline-warning kakao-map-go" onClick={ goToKakaoMap}>카카오맵으로 길찾기</button></span>
                    <span style={ { fontSize: "26px" } }>평균 별점 : { (avgScore === 5) ? "★★★★★" : (
                                                                       (avgScore >= 4) ? "★★★★☆" : (
                                                                       (avgScore >= 3) ? "★★★☆☆" : (
                                                                       (avgScore >= 2) ? "★★☆☆☆" : (
                                                                       (avgScore >= 1) ? "★☆☆☆☆" : 
                                                                                             "☆☆☆☆☆"))))} ({ avgScore })</span>
                </div>
                {/* 맵 렌더링 */}
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
            <br /><hr /><br />
            {/* 거점 상세 텍스트 설명 */}
            <div>
                <p align="center" style={ { fontSize : "20px" } }>
                    { hub.description }
                </p>
            </div>
            
            {/* 추가 이미지 렌더링 영역 (썸네일 제외한 나머지 파일) */}
            { (hub.hubFileList.length > 1) ? (
                <>
                    <br />
                    <hr />
                    <br />
                    <div className="img-area d-flex">
                        {/* 배열의 index 1번부터(두 번째 이미지부터) 끝까지 순회하며 출력 */}
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
            {/* 권한 및 상태에 따른 하단 버튼 영역 */}
            <div className='button-area'>
                {/* 거점이 중단(CLOSED) 상태가 아니고 관리자(ADMIN) 권한일 때만 수정/중단 버튼 노출 */}
                { (hub.hubStatus === "CLOSED" || loginUser.authCode !== "ADMIN") ? "" : (
                    <>
                        <button className='btn btn-warning' onClick={ () => { navigate(`/hub/updateForm/${hubNo}`) } }>수정하기</button>&nbsp;
                        <button className='btn btn-danger' onClick={ deleteHub }>중단하기</button>
                    </>
                )}
                {/* 공통 뒤로가기 버튼 */}
                <button className='btn btn-dark' onClick={ () => { navigate(-1) } }>뒤로가기</button>
            </div>
            </div>
            </div>
        </main>
    );
}

export default HubDetailComponent;
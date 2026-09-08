import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectStaffDashboardApi, selectStaffReservationListApi } from "../api/dashboardApi";
import LocationCheckModal from "../../common/components/LocationCheckModal";

/**
 * 일반 임직원(Staff) 전용 대시보드 컴포넌트
 * 로그인한 사용자의 사번을 기반으로 개인 워케이션 현황, 오늘의 근태(위치 및 출근 체크),
 * 업무 계획, 업무 진행률, 공지사항 및 필터링 가능한 개인 예약 리스트를 제공합니다.
 * @param {Object} props - 부모 컴포넌트로부터 전달받은 속성
 * @param {Object} props.loginUser - 현재 로그인한 사용자 정보 객체 (사번 포함)
 */
function StaffComponent(props) {

    // 임직원 대시보드에 표현될 개인 요약 정보, 근태 위치, 공지사항 및 예약 리스트 데이터를 담는 상태 정의
    const [data, setData] = useState({
        workcationCount: 0,
        amountSupport: 0,
        useAmount: 0,
        WorkcationIsTrue: false,
        workcationPlan: "",
        progressRate: 100,
        hubAddress : "",
        noticeData: [],
        reservationList: []
    });

    const [address, setAddress] = useState("");

    // 출근/퇴근 상태 관리 (false: 출근 전, true: 출근 완료/퇴근 전)
    const [isCheckedIn, setIsCheckedIn] = useState(false);

    // 개인 예약 리스트 검색 및 필터링(기간, 키워드)을 위한 입력 상태 관리
    const [inputData, setInputData] = useState({
        keyword: "",
        startAt: "",
        endAt: ""
    });

    // 카카오맵 SDK 로드 완료 여부 State
    const [isLoaded, setIsLoaded] = useState(false);

    // 모달 제어용 State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hubInfo, setHubInfo] = useState(null);

    const loginUser = props.loginUser;

    // 페이지 이동을 위한 useNavigate 훅 선언
    const navigate = useNavigate();

    // Kakao API 사용을 위한 window 객체 참조
    const { kakao } = window;

    /**
     * 날짜 데이터를 한국어 지역 형식(YYYY. MM. DD.)으로 안전하게 포맷팅하는 함수
     * @param {string|Date} date - 포맷팅할 날짜 객체 또는 문자열
     * @returns {string} 포맷팅된 날짜 문자열 또는 '-'
     */
    const formatDate = (date) => {
        if (!date) {
            return '-';
        }
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return '-';
        }
        return d.toLocaleDateString('ko-KR');
    };

    /**
     * autoload=false 환경에서 kakao.maps.load()로 SDK 초기화 감지
     */
    useEffect(() => {
        const checkKakaoMap = () => {
            if (kakao.maps) {
                kakao.maps.load(() => {
                    setIsLoaded(true); // 로딩 완료 처리
                    if (kakao.maps.services) {
                        // 컴포넌트 마운트 시 카카오 지오코더를 이용한 현재 위치 조회 및 임직원 대시보드 API 호출
                        const geocoder = new kakao.maps.services.Geocoder();
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                geocoder.coord2Address(pos.coords.longitude, pos.coords.latitude, (result) => {
                                    if(result.length > 0) {
                                        setAddress(result[0].address.address_name);
                                    }
                                });
                            }
                        );
                    }
                });
            } else {
                setTimeout(checkKakaoMap, 100); // 스크립트 로드 대기
            }
        };
        checkKakaoMap();
    }, [kakao]);

    useEffect(() => {
        const selectStaffDashboard = async () => {
            try {
                // 임직원 대시보드 데이터 조회 API 호출 (사번 전달)
                const response = await selectStaffDashboardApi(loginUser.empNo);
                // API 응답 데이터로 대시보드 상태 값 업데이트
                setData(response.data);
            } catch(error) {
                console.error(error);
            }
        }
        selectStaffDashboard();
    }, [loginUser.empNo]);

    /**
     * 출근하기 버튼 클릭 시 호출되는 핸들러 함수
     * 워케이션 등록 여부에 따라 출근 처리를 수행하거나 안내 메시지를 띄웁니다.
     * @param {Object} e - 이벤트 객체
     */
    const commuteClicker = e => {
        e.preventDefault();

        const now = new Date();
        const currentHour = now.getHours();

        if (!data.WorkcationIsTrue) {
            alert("등록된 워케이션이 없습니다.");
            return; 
        }

        // 출근 시간 체크 (08:00 ~ 12:00)
        if (!isCheckedIn) {
            if (currentHour < 8 || currentHour >= 12) {
                alert("지금은 출근 시간이 아닙니다. (출근 가능 시간: 08:00 ~ 12:00)");
                return;
            }
        } 
        // 퇴근 시간 체크 (17:00 ~ 23:00) - 필요에 따라 시간 변경 가능
        else {
            if (currentHour < 17 || currentHour >= 23) {
                alert("지금은 퇴근 시간이 아닙니다. (퇴근 가능 시간: 17:00 ~ 23:00)");
                return;
            }
        }

        if (!kakao || !kakao.maps || !kakao.maps.services) {
            alert("지도 API가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        // 거점 주소를 좌표로 변환
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(data.hubAddress, (result, status) => {
            
            if (status === kakao.maps.services.Status.OK) {
                // 모달에 넘겨줄 거점 정보 세팅
                setHubInfo({
                    hubName: data.hubAddress || "워케이션 거점", 
                    latitude: parseFloat(result[0].y),
                    longitude: parseFloat(result[0].x),
                    allowedRadius: 100 // 허용 반경 100m
                });
                
                // 모달 열기
                setIsModalOpen(true);
            } else {
                alert("거점 주소를 좌표로 변환할 수 없습니다.");
            }
        });

    }

    /**
     * 모달에서 위치 인증 완료 후 실제 출근(API) 처리
     */
    const handleCheckInModal = async (checkInData) => {
        try {
            const now = new Date();
            
            if (checkInData.attendanceType === "IN") {
                const isLate = now.getHours() >= 9 && now.getMinutes() > 10;
                alert(isLate ? "출근 성공 (지각)" : "출근 성공");
                setIsCheckedIn(true); // 출근 완료 상태로 변경
            } else {
                alert("퇴근 성공");
                setIsCheckedIn(false); // 퇴근 완료 상태로 변경
            }
            
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("출퇴근 처리 중 오류가 발생했습니다.");
        }
    };

    /**
     * 사용자가 검색 폼의 입력값(날짜, 검색어 등)을 변경할 때 호출되는 핸들러 함수
     * @param {Object} e - 이벤트 객체
     */
    const handleChange = e => {
        // 기존 inputData를 복사한 뒤, 이벤트를 발생시킨 태그의 name 속성을 Key로 하여 값을 업데이트합니다.
        setInputData({...inputData, [e.target.name]: e.target.value});

    };

    /**
     * 개인 예약 리스트 검색 버튼 클릭 시 호출되는 핸들러 함수
     * 지정된 기간과 검색어(키워드) 조건으로 백엔드 API를 호출하여 예약 리스트를 갱신합니다.
     * @param {Object} e - 이벤트 객체
     */
    const handleSearch = async e => {
        e.preventDefault();
        try {
            // 개인 예약 리스트 조회/검색 API 호출
            const response = await selectStaffReservationListApi(loginUser.empNo, inputData);

            console.log(response.data)

            // 응답받은 예약 리스트 데이터로 상태 갱신
            setData(prevData => ({
                ...prevData,
                reservationList: response.data
            }));
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div className="dashboard-content">
            {/* 개인 워케이션 현황 및 근태, 업무 계획, 진행률 테이블 */}
            <table className="table staff-table">
                <tbody>
                    {/* 나의 워케이션 현황 (횟수, 남은 지원금, 사용 비용) */}
                    <tr>
                        <th>나의 워케이션 현황</th>
                        <td>
                            <div>
                                <span>워케이션 간 횟수 : {data.workcationCount}회</span>&nbsp;&nbsp;&nbsp;
                                <span>사용한 지원금(지자체 지원금 제외) : {data.amountSupport}원</span>&nbsp;&nbsp;&nbsp;
                                <span>사용 비용 : {data.useAmount}원</span>
                            </div> 
                        </td>
                    </tr>
                    {/* 오늘의 근태 (출근하기 버튼 및 현재 위치 표시) */}
                    <tr>
                        <th>오늘의 근태</th>
                        <td>
                            <div>
                                <button className="btn btn-primary dashboard-primary" disabled={!data.WorkcationIsTrue} onClick={ commuteClicker }>
                                    {isCheckedIn ? "퇴근하기" : "출근하기"}
                                </button><br />
                                <span>현재 위치 : { (isLoaded) ? address : ""}</span>
                            </div>
                        </td>
                    </tr>
                    {/* 나의 워케이션 업무계획 */}
                    <tr>
                        <th>나의 워케이션 업무계획</th>
                        <td>
                            <span>{(data.workcationPlan) ? data.workcationPlan : "등록된 워케이션 일정이 없습니다."}</span>
                        </td>
                    </tr>
                    {/* 개인 업무 진행률 프로그레스 바 */}
                    <tr>
                        <th>업무 진행률</th>
                        <td>
                            <div className="progress dashboard-progress w-100">
                                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${data.progressRate}%` }}></div>
                                <div className="d-flex dashboard-progress-text">
                                    {data.progressRate}% / 100%
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <br /><br />
            {/* 공지사항 섹션 타이틀 및 목록 테이블 */}
            <div className="dashboard-1" align="center">공지사항</div>
            <div className="dashboard-4">
                <table className="table table-hover">
                    <tbody>
                        { data.noticeData.length === 0 ? (
                                <tr style={ { cursor : "auto", backgroundColor: "white"} }>
                                    <td colSpan="4" >
                                        등록된 공지사항이 없습니다.
                                    </td>
                                </tr>
                            ) : data.noticeData.map(
                                (notice) => (
                                    // 공지사항 행 클릭 시 상세 페이지로 이동
                                    <tr key={ notice.noticeNo } className="notice-row" onClick={ () => navigate(`/notice/${notice.noticeNo}`) }>
                                        <td className="notice-title-cell">
                                            {/* 중요 공지사항일 경우 '중요' 뱃지 표시 */}
                                            { notice.noticeStatus ==='IMPORTANT' && (
                                                    <span className="notice-important">중요</span>
                                            )}
                                            { notice.noticeTitle }
                                        </td>
                                        <td>
                                            { notice.empName || '-' }
                                        </td>
                                        <td>
                                            { formatDate(notice.createdAt)}
                                        </td>
                                        <td>
                                            { notice.viewCount ?? 0 }
                                        </td>
                                    </tr>
                                )
                            )
                        }
                    </tbody>
                </table>
            </div>
            <br /><br />
            {/* 예약 리스트 섹션 타이틀 및 검색 필터 영역 */}
            <div className="dashboard-1" align="center">예약 리스트</div>
            <br />
            {/* 검색 필터 바 (시작일~종료일 기간 선택 및 키워드 검색창) */}
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 w-40">
                    <input type="date" className="form-control" name="startAt" onChange={ handleChange } value={ inputData.startAt } />
                    <span className="text-nowpx">&nbsp;~~~&nbsp;</span>
                    <input type="date" className="form-control" name="endAt" onChange={ handleChange } value={ inputData.endAt } />
                </div>
                <div className="input-group w-50">
                    <input type="search" className="form-control" placeholder="이름을 입력해주세요." name="keyword" onChange={ handleChange } value={ inputData.keyword } />
                    <button type="submit" className="btn btn-outline-secondary search-button" onClick={ handleSearch }>🔍</button>
                </div>
            </div>
            <br />
            {/* 개인 예약 리스트 테이블 */}
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>숙소명</th>
                            <th>예약일자</th>
                            <th>인원</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.reservationList?.length > 0 ? (
                            data.reservationList.map((item, index) => (
                                <tr key={index} onClick={ () => { navigate(`/reservations/${item.rsvNo}`) } }>
                                    <td>{item.hubName}</td>
                                    <td>{item.rsvStart?.substring(5, 10)}~{item.rsvEnd?.substring(5, 10)}</td>
                                    <td>{item.userCapacity}</td>
                                    <td>{ (item.rsvState === "Y") ? "예약완료" : ((item.rsvState === "C") ? "예약취소" : "예약대기")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr style={ { cursor : "auto", backgroundColor : "white" } }>
                                <td colSpan="6">예약 건이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <LocationCheckModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                hub={hubInfo}
                onCheckIn={handleCheckInModal}
                isCheckedIn={isCheckedIn}
            />
        </div>
    )
}

export default StaffComponent;
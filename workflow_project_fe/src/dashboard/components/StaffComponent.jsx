import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selectStaffDashboardApi, selectStaffReservationListApi } from "../api/dashboardApi";

function StaffComponent(props) {

    const [data, setData] = useState({
        workcationCount: 0,
        amountSupport: 0,
        useAmount: 0,
        isWorkcation: false,
        workcationPlan: "",
        position: "",
        progressRate: 100,
        noticeData: []
    });

    const [inputData, setInputData] = useState({
        keyword: "",
        startAt: "",
        endAt: ""
    });

    const loginUser = props.loginUser;

    const navigate = useNavigate();

    // Kakao API 사용을 위한 window 객체 참조
    const { kakao } = window;

    // 날짜 데이터를 한국어 지역 형식으로 안전하게 포맷팅하는 함수
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

    useEffect(() => {
        const geocoder = new kakao.maps.services.Geocoder();
        navigator.geolocation.getCurrentPosition(
            (data) => {
                geocoder.coord2Address(data.coords.longitude, data.coords.latitude, (result) => {
                    setData(prevData => ({
                        ...prevData,
                        position: result[0].address.address_name
                    }));
                });
            }
        );

        const selectStaffDashboard = async () => {
            
            try {
                
                const response = await selectStaffDashboardApi(loginUser.empNo);
                
                console.log(response.data);

                setData(response.data);

            } catch(error) {
                console.error(error);
            }
        }

        selectStaffDashboard();

    }, [kakao]);

    const commuteClicker = async e => {

        e.preventDefault();

        if(!data.isWorkcation) {            
            try {

                alert("출근 성공");

            } catch(error) {
                console.error(error);
            }
        } else {
            alert("등록된 워케이션이 없습니다.");
        }
    }

    // 사용자가 검색 폼의 값을 변경할 때 호출되는 핸들러입니다.
    const handleChange = e => {
        
        // 기존 inputData를 복사한 뒤, 이벤트를 발생시킨 태그의 name 속성을 Key로 하여 값을 업데이트합니다.
        setInputData({...inputData, [e.target.name]: e.target.value});

    };

    const handleSearch = async e => {

        e.preventDefault();

        try {
            const response = await selectStaffReservationListApi(loginUser.empNo, inputData);

            setData(prevData => ({
                ...prevData,
                workcationList: response.data
            }));
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <div className="content">
            <table className="table staff-table">
                <tbody>
                    <tr>
                        <th>나의 워케이션 현황</th>
                        <td>
                            <div>
                                <span>워케이션 간 횟수 : {data.workcationCount}회</span>&nbsp;&nbsp;&nbsp;
                                <span>남은 지원금 : {data.amountSupport}원</span>&nbsp;&nbsp;&nbsp;
                                <span>사용 비용 : {data.useAmount}원</span>
                            </div> 
                        </td>
                    </tr>
                    <tr>
                        <th>오늘의 근태</th>
                        <td>
                            <div>
                                <button className="btn btn-primary" disabled={!data.isWorkcation} onClick={ commuteClicker }>
                                    출근하기
                                </button><br />
                                <span>현재 위치 : {data.position}</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>나의 워케이션 업무계획</th>
                        <td>
                            <span>{(data.workcationPlan) ? data.workcationPlan : "등록된 워케이션 일정이 없습니다."}</span>
                        </td>
                    </tr>
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
            <div className="dashboard-1" align="center">공지사항</div>
            <div className="dashboard-4">
                <table className="table table-hover">
                    <tbody>
                        { data.noticeData.length === 0 ? (
                                <tr style={ { cursor : "auto", backgroundColor: "white"} }>
                                    <td colSpan="5" >
                                        등록된 공지사항이 없습니다.
                                    </td>
                                </tr>
                            ) : data.noticeData.map(
                                (notice) => (
                                    // 공지사항 행 클릭 시 상세 페이지로 이동
                                    <tr key={ notice.noticeNo } className="notice-row" onClick={ () => navigate(`/notice/${notice.noticeNo}`) }>
                                        <td>{ notice.noticeNo }</td>
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
            <div className="dashboard-1" align="center">예약 리스트</div>
            <br />
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
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>예약일자</th>
                            <th>인원</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>군대</td>
                            <td>2024-06-24 ~ 2026-12-23</td>
                            <td>1명</td>
                            <td>예약완료</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StaffComponent;
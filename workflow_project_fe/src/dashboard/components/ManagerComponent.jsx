import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { selectManagerDashboardApi, selectManagerWorkcationListApi } from "../api/dashboardApi";
import "../css/dashboard.css"

/**
 * 부서장(Manager) 전용 대시보드 컴포넌트
 * 로그인한 사용자의 부서 ID를 기반으로 부서 워케이션 현황, 승인 대기 목록, 정산 대기 목록,
 * 부서 평균 업무 진행률 및 필터링 가능한 부서 워케이션 신청 목록을 시각화하여 제공합니다.
 * @param {Object} props - 부모 컴포넌트로부터 전달받은 속성
 * @param {Object} props.loginUser - 현재 로그인한 사용자 정보 객체 (부서 ID 포함)
 */
function ManagerComponent(props) {

    const loginUser = props.loginUser;

    // 부서장 대시보드에 표현될 상단/중단 요약 통계, 차트, 리스트 데이터를 담는 객체 상태 정의
    const [data, setData] = useState({
        depTitle: "",
        totalApply: 0,
        waiting: 0,
        inProgress: 0,
        budgetExhaustionRate: 0,
        avgProgressRate: 100,
        waitingList: [],
        regionData: [],
        noticeData: [],
        balanceList: [],
        workcationList: []
    });

    // 부서 워케이션 목록 검색 및 필터링(기간, 키워드)을 위한 입력 상태 관리
    const [inputData, setInputData] = useState({
        keyword: "",
        startAt: "",
        endAt: ""
    });

    // 컴포넌트가 처음 마운트될 때 백엔드 대시보드 API를 호출하여 데이터 상태를 갱신
    useEffect(() => {
        const selectDashboardData = async () => {
            try {
                // 부서장 대시보드 데이터 조회 API 호출 (부서 ID 전달)
                const response = await selectManagerDashboardApi(loginUser.depId);

                // API 응답 데이터로 대시보드 상태 값 업데이트
                setData(response.data);
            } catch (error) {
                // API 호출 실패 시 에러 로그 출력
                console.error(error);
            }
        };
        
        selectDashboardData();
    }, []);

    // 페이지 이동을 위한 useNavigate 훅 선언
    const navigate = useNavigate();

    /**
     * 사용자가 검색 폼의 입력값(날짜, 검색어 등)을 변경할 때 호출되는 핸들러 함수
     * @param {Object} e - 이벤트 객체
     */
    const handleChange = e => {
        // 기존 inputData를 복사한 뒤, 이벤트를 발생시킨 태그의 name 속성을 Key로 하여 값을 업데이트합니다.
        setInputData({...inputData, [e.target.name]: e.target.value});
    };

    /**
     * 부서 워케이션 목록 검색 버튼 클릭 시 호출되는 핸들러 함수
     * 지정된 기간과 검색어(키워드) 조건으로 백엔드 API를 호출하여 워케이션 목록을 갱신합니다.
     * @param {Object} e - 이벤트 객체
     */
    const handleSearch = async e => {
        e.preventDefault();

        try {
            // 부서 워케이션 검색/조회 API 호출
            const response = await selectManagerWorkcationListApi(loginUser.depId, inputData);

            // 응답받은 워케이션 목록 데이터로 상태 갱신
            setData(prevData => ({
                ...prevData,
                workcationList: response.data
            }));
        } catch (error) {
            console.error(error);
        }
    }

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

    return (
        <div className="dashboard-content">
            {/* 대시보드 상단 타이틀 (부서명 동적 표시) */}
            <div className="dashboard-1" align="center">{data.depTitle} 워케이션 현황</div>
            <br />
            {/* 이번 달 요약 지표 영역 (총 신청, 승인대기, 진행중, 예산 소진율) */}
            <div className="d-flex justify-content-between dashboard-3">
                <p>총 신청 건수 : { data.totalApply }건</p>
                <p>승인대기 : { data.waiting }건</p>
                <p>현재 진행중 : { data.inProgress }건</p>
                <p>예산 소진율 : { data.budgetExhaustionRate }%</p>
            </div>
            <br /><br />
            {/* 승인대기 목록 및 지역별 통계 섹션 헤더 */}
            <div className="d-flex text-center dashboard-1">
                <p className="w-50 mb-0">승인대기 목록</p>
                <p className="w-50 mb-0">지역별 이용 통계</p>
            </div>
            <br />
            {/* 승인대기 테이블 및 지역별 이용률 텍스트 표시 영역 */}
            <div className="d-flex text-center">
                {/* 좌측: 승인 대기 중인 워케이션 신청 리스트 테이블 */}
                <div className="w-50">
                    <table className="table">
                        <thead>
                            <tr style={ { cursor : "auto" } }>
                                <th>이름</th>
                                <th>지역</th>
                                <th>일정</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.waitingList?.length > 0 ? (
                                data.waitingList.map((item, index) => (
                                    <tr key={index} style={ { cursor : "auto" } }>
                                        <td>{item.empName}</td>
                                        <td>{item.mainRegion}</td>
                                        <td>{item.startAt?.substring(5, 10)}~{item.endAt?.substring(5, 10)}</td>
                                        <td>[{ (item.approverState === "W") ? "대기" : (item.approverState === "R") ? "검토" : "보류" }]</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">승인 대기 건이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* 우측: 주요 지역별(제주, 강원, 부산) 이용 통계 수치 표출 */}
                <div className="d-flex w-50 dashboard-3">
                    <p>제주 : {data.regionData?.find(item => item.name === '제주' || item.name === '제주도')?.value ?? 0}%</p>
                    <p>강원 : {data.regionData?.find(item => item.name === '강원' || item.name === '강원도')?.value ?? 0}%</p>
                    <p>부산 : {data.regionData?.find(item => item.name === '부산' || item.name === '부산시')?.value ?? 0}%</p>
                </div>
            </div>
            <br /><br /><br /><br />
            {/* 공지사항 섹션 타이틀 및 게시판 목록 테이블 */}
            <div className="dashboard-1" align="center">공지사항</div>
            <div className="dashboard-4">
                <table className="table table-hover">
                    <tbody>
                        { data.noticeData?.length === 0 ? (
                                <tr style={ { cursor : "auto", backgroundColor: "white"} }>
                                    <td colSpan="5">
                                        등록된 공지사항이 없습니다.
                                    </td>
                                </tr>
                            ) : data.noticeData?.map(
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
            {/* 부서 평균 업무 진행률 및 정산대기 목록 섹션 헤더 */}
            <div className="d-flex text-center dashboard-1">
                <p className="w-50 mb-0">부서 평균 업무 진행률</p>
                <p className="w-50 mb-0">정산대기 목록</p>
            </div>
            <br />
            {/* 부서 평균 업무 진행률 프로그레스 바 및 정산 대기 목록 테이블 영역 */}
            <div className="d-flex justify-content-between align-items-start">
                {/* 좌측: 부서 업무 진행률 시각화 프로그레스 바 */}
                <div style={{ width: '48%' }}>
                    <div className="progress dashboard-progress w-100">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${data.avgProgressRate}%` }}></div>
                        <div className="d-flex dashboard-progress-text">
                            {data.avgProgressRate}% / 100%
                        </div>
                    </div>
                </div>
                {/* 우측: 정산 대기 목록 테이블 */}
                <div style={{ width: '48%' }}>
                    <table className="table">
                        <thead>
                            <tr style={ { cursor : "auto" } }>
                                <th>이름</th>
                                <th>사번</th>
                                <th>금액</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.balanceList?.length > 0 ? (
                                data.balanceList.map((item, index) => (
                                    <tr key={index} style={ { cursor : "auto" } }>
                                        <td>{item.empName}</td>
                                        <td>{item.empId}</td>
                                        <td>{item.amount?.toLocaleString('ko-KR')}원</td>
                                        <td>[{ (item.approverState === "W") ? "대기" : ""}]</td>
                                    </tr>
                                ))
                            ) : (
                                <tr style={ { cursor : "auto" } }>
                                    <td colSpan="5">정산 대기 건이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <br /><br />
            {/* 부서 워케이션 목록 섹션 타이틀 및 검색 필터 영역 */}
            <div className="dashboard-1" align="center">부서 워케이션 목록</div>
            <br />
            {/* 검색 필터 바 (시작일~종료일 기간 선택 및 키워드 검색창) */}
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2 w-40">
                    <input type="date" className="form-control" name="startAt" onChange={ handleChange } value={ inputData.startAt } />
                    <span className="text-nowpx">&nbsp;~~~&nbsp;</span>
                    <input type="date" className="form-control" name="endAt" onChange={ handleChange } value={ inputData.endAt } />
                </div>
                <div className="input-group w-50">
                    <input type="search" className="form-control" placeholder="제목 및 이름 입력해주세요." name="keyword" onChange={ handleChange } value={ inputData.keyword } />
                    <button type="submit" className="btn btn-outline-secondary search-button" onClick={ handleSearch }>🔍</button>
                </div>
            </div>
            <br />
            {/* 부서 워케이션 신청 목록 테이블 */}
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr style={ { cursor: "auto" } }>
                            <th>번호</th>
                            <th>제목</th>
                            <th>지역</th>
                            <th>기간</th>
                            <th>이름</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.workcationList?.length > 0 ? (
                            data.workcationList.map((item, index) => (
                                <tr key={index} onClick={ () => { navigate(`/workcation/detail/${item.workcationNo}`) } }>
                                    <td>{index+1}</td>
                                    <td>{item.workcationTitle}</td>
                                    <td>{item.mainRegion} {item.subRegion}</td>
                                    <td>{item.startAt?.substring(5, 10)}~{item.endAt?.substring(5, 10)}</td>
                                    <td>{item.empName}</td>
                                    <td>{ (item.approverState === "W") ? "대기" : 
                                          (item.approverState === "A") ? "승인" :
                                          (item.approverState === "C") ? "취소" :
                                          (item.approverState === "H") ? "보류" :
                                          (item.approverState === "J") ? "반려" : "검토"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr style={ { cursor : "auto", backgroundColor : "white" } }>
                                <td colSpan="6">워케이션 신청 건이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ManagerComponent;
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { selectManagerDashboardApi } from "../api/dashboardApi";
import "../css/dashboard.css"

function ManagerComponent(props) {

    const loginUser = props.loginUser;

    // 부서장 대시보드에 표현될 상단/중단 요약 통계, 차트, 리스트 데이터를 담는 객체 상태 정의
    const [data, setData] = useState({
        depTitle: "",
        totalApply: 0,
        waiting: 0,
        inProgress: 0,
        budgetExhaustionRate: 0,
        avgProgressRate: 45.6,
        waitingList: [],
        regionData: [],
        noticeData: [],
        balanceList: [],
        workcationList: []
    });

    // 컴포넌트가 처음 마운트될 때 백엔드 대시보드 API를 호출하여 데이터 상태를 갱
    useEffect(() => {
        const selectDashboardData = async () => {
            try {
                // 관리자 대시보드 데이터 조회 API 호출
                const response = await selectManagerDashboardApi(loginUser.depId);

                console.log(response.data);

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

    return (
        <div className="content">
            {/* 대시보드 상단 타이틀 */}
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
                                        <td>{item.startAt.substring(5, 10)}~{item.endAt.substring(5, 10)}</td>
                                        <td>[{ (item.approverState === "W") ? "대기" : ""}]</td>
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
                    <p>제주 : {data.regionData?.find(item => item.name === '제주')?.value ?? 0}%</p>
                    <p>강원 : {data.regionData?.find(item => item.name === '강원')?.value ?? 0}%</p>
                    <p>부산 : {data.regionData?.find(item => item.name === '부산')?.value ?? 0}%</p>
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
            <div className="d-flex text-center dashboard-1">
                <p className="w-50 mb-0">부서 평균 업무 진행률</p>
                <p className="w-50 mb-0">정산대기 목록</p>
            </div>
            <br />
            <div className="d-flex justify-content-between align-items-start">
                <div style={{ width: '48%' }}>
                    <div className="progress dashboard-progress w-100">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${data.avgProgressRate}%` }}></div>
                        <div className="d-flex dashboard-progress-text">
                            {data.avgProgressRate}% / 100%
                        </div>
                    </div>
                </div>
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
                                        <td>{item.amount.toLocaleString('ko-KR')}원</td>
                                        <td>[{ (item.approverState === "W") ? "대기" : ""}]</td>
                                    </tr>
                                ))
                            ) : (
                                <tr style={ { cursor : "auto" } }>
                                    <td colSpan="5">승인 대기 건이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <br /><br />
            <div className="dashboard-1" align="center">부서 워케이션 목록</div>
            <br /><br />
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>지역</th>
                            <th>기간</th>
                            <th>이름</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>3</td>
                            <td>업무 집중 및 생산성 향상</td>
                            <td>강원도 철원군</td>
                            <td>09-01~03-31</td>
                            <td>김입대</td>
                            <td>승인</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>업무 집중 및 생산성 향상</td>
                            <td>강원도 강릉시</td>
                            <td>09-04~09-09</td>
                            <td>지민석</td>
                            <td>대기</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td>업무 집중 및 생산성 향상</td>
                            <td>강원도 춘천시</td>
                            <td>09-01~09-05</td>
                            <td>탁사원</td>
                            <td>반려</td>
                        </tr>
                        {data.workcationList?.length > 0 ? (
                            data.workcationList.map((item, index) => (
                                <tr key={index} style={ { cursor : "auto" } }>
                                    <td>{item.workcationNo}</td>
                                    <td>{item.mainRegion} {item.subRegion}</td>
                                    <td>{item.startDate.substring(5, 10)}~{item.endDate.substring(5, 10)}</td>
                                    <td>{item.empName}</td>
                                    <td>{ (item.approverState === "W") ? "대기" : 
                                          (item.approverState === "A") ? "승인" :
                                          (item.approverState === "C") ? "취소" :
                                          (item.approverState === "H") ? "보류" :
                                          (item.approverState === "J") ? "반려" : "검토"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr style={ { cursor : "auto" } }>
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
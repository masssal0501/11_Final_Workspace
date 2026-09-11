import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { selectAdminDashboardApi } from "../api/dashboardApi";
import "../css/dashboard.css"

/**
 * 관리자(Admin) 전용 대시보드 컴포넌트
 * 전사 워케이션 신청 현황, 승인 대기 목록, 지역별/월별/부서별 통계 차트 및 예산 집행률을 시각화하여 제공합니다.
 */
function AdminComponent() {
    
    // 관리자 대시보드에 표현될 상단/중단 요약 통계, 차트, 리스트 데이터를 담는 객체 상태 정의
    const [data, setData] = useState({
        totalApply: 0,
        waiting: 0,
        inProgress: 0,
        budgetExhaustionRate: 0,
        usageRate: 0,
        totalBudget: 0,
        avgSatisfaction: 0,
        avgDuration: 0,
        supportFund: 0,
        totalParticipants: 0,
        totalCost: 0,
        budgetData: 100,
        waitingList: [],
        regionData: [],
        noticeData: [],
        monthlyData: [],
        shareData: [],
        categoryData: [],
        deptData: [],
    });

    // 컴포넌트가 처음 마운트될 때 백엔드 대시보드 API를 호출하여 데이터 상태를 갱신
    useEffect(() => {
        const selectDashboardData = async () => {
            try {
                // 관리자 대시보드 데이터 조회 API 호출
                const response = await selectAdminDashboardApi();

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
     * 거점 오피스, 지출 항목, 부서 이름에 따라 고유한 색상 코드를 반환하는 함수
     * @param {string} name - 차트 항목 이름 (지역, 항목, 부서명 등)
     * @returns {string} HEX 색상 코드
     */
    const getOfficeColor = (name) => {
        if (name === '강원' || name === '강원도') return '#ff8042';
        if (name === '제주' || name === '제주도') return '#8884d8';
        if (name === '부산' || name === '부산시') return '#00C49F';
        if (name === '숙박') return '#45eed8';
        if (name === '식비') return '#fa6666';
        if (name === '기타') return '#ffd094';
        if (name === '교통') return '#70ff70';
        if (name === '체험') return '#9efb8b';
        if (name === '차량') return '#fb8ce2';
        if (name === '기획부') return '#ffb3b3';
        if (name === '디자인부') return '#ffb3e6';
        if (name === 'FE 개발부') return '#b3b3ff';
        if (name === 'BE 개발부') return '#b3e6ff';
        if (name === '데이터부') return '#b3ffb3';
        if (name === 'QA부서') return '#ffffb3';
        return '#a4b0be';
    };

    /**
     * percent 파라미터(0~1)를 받아서 퍼센티지를 계산하는 라벨 렌더링 함수
     */
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-midAngle * RADIAN);
        const cos = Math.cos(-midAngle * RADIAN);
        const percentValue = Math.round(percent * 100);

        if (percentValue === 0) return null;

        if (percentValue <= 15) {
            const sx = cx + (outerRadius + 5) * cos;
            const sy = cy + (outerRadius + 5) * sin;
            const mx = cx + (outerRadius + 15) * cos;
            const my = cy + (outerRadius + 15) * sin;
            const ex = mx + (cos >= 0 ? 1 : -1) * 12;
            const ey = my;
            const textAnchor = cos >= 0 ? 'start' : 'end';

            return (
                <g>
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#888" fill="none" />
                    <text x={ex + (cos >= 0 ? 3 : -3)} y={ey} textAnchor={textAnchor} fill="#333" dominantBaseline="central" style={{ fontSize: '11px' }}>
                        {`${name} ${percentValue}%`}
                    </text>
                </g>
            );
        } else {
            // 비중이 15% 초과일 경우, 파이 조각 안쪽에 텍스트 직접 표시
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * cos;
            const y = cy + radius * sin;

            return (
                <text x={x} y={y} fill="#333" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {`${name} ${percentValue}%`}
                </text>
            );
        }
    };

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

    return(
        <main className="wf-container">
            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">대시보드</h1>
                    <p className="wf-page-description">전사 워케이션 현황, 승인 대기 및 예산 통계를 한눈에 확인합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
            <div className="dashboard-content">
            {/* 대시보드 상단 타이틀 */}
            <div className="dashboard-1" align="center">이번달 워케이션 현황</div>
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
                                <th>부서</th>
                                <th>지역</th>
                                <th>일정</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.waitingList.length > 0 ? (
                                data.waitingList.map((item, index) => (
                                    <tr key={index} style={ { cursor : "auto" } }>
                                        <td>{item.empName}</td>
                                        <td>{item.depTitle}</td>
                                        <td>{item.mainRegion}</td>
                                        <td>{item.startAt?.substring(5, 10)}~{item.endAt?.substring(5, 10)}</td>
                                        <td>{ (item.approverState === "W")
                                                ? <span className="badge bg-warning">대기</span>
                                                : (item.approverState === "R")
                                                    ? <span className="badge bg-info">검토</span>
                                                    : <span className="badge bg-secondary">보류</span> }</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="wf-empty-row">
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
                        { data.noticeData.length === 0 ? (
                                <tr className="wf-empty-row">
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
            {/* 워케이션 통계 정보 섹션 */}
            <div className="dashboard-1" align="center">워케이션 통계</div>
            <br />
            {/* 통계 지표 1열 */}
            <div className="d-flex justify-content-between dashboard-3">
                <p>총 참여 인원 : { data.totalParticipants } 명</p>
                <p>회사 부담금 : { data.totalBudget?.toLocaleString('ko-KR') }원</p>
                <p>평균 만족도 : { data.avgSatisfaction } / 5.0</p>                
            </div>
            {/* 통계 지표 2열 */}
            <div className="d-flex justify-content-between dashboard-3">
                <p>평균 워케이션 기간 : { data.avgDuration }일</p>
                <p>보유 지원금 : { data.supportFund?.toLocaleString('ko-KR') }원</p>
                <p>워케이션 이용률 : { data.usageRate }%</p>
            </div>
            {/* 통계 지표 3열: '총 비용' 항목을 justify-content-center를 이용해 정중앙으로 배치 */}
            <div className="d-flex justify-content-center dashboard-3">
                <p>총 비용 : { data.totalCost?.toLocaleString('ko-KR') }원</p>
            </div>
            <br /><hr />
            {/* 월별 참가 현황 및 거점 오피스별 점유율 차트 영역 헤더 */}
            <div className="d-flex text-center dashboard-1">
                <p className="w-50 mb-0">월별 참가 현황</p>
                <p className="w-50 mb-0">거점 오피스별 점유율</p>
            </div>
            {/* 월별 바 차트 및 거점 오피스 파이 차트 컨테이너 */}
           <div className="d-flex text-center py-3" style={ { height: '300px' } }>
                {/* 좌측: 월별 참가 인원 막대그래프 */}
                <div className="w-50 h-100">
                    {data.monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.monthlyData.map(item => ({ ...item, name: `${item.name}월` }))}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#333333" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            데이터가 존재하지 않습니다.
                        </div>
                    )}
                </div>
                {/* 우측: 거점 오피스별 점유율 파이 차트 */}
                <div className="w-50 h-100">
                    {data.shareData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data.shareData.map(item => ({
                                        ...item,
                                        fill: getOfficeColor(item.name)
                                    }))}  
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={100} 
                                labelLine={false} 
                                label={renderCustomLabel}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            데이터가 존재하지 않습니다.
                        </div>
                    )}
                </div>
            </div>
            <br /><br />
            {/* 예산 관련 시각화 분석 섹션 */}
            <div className="dashboard-1" align="center">예산</div>
            <div className="d-flex text-center py-4" style={{ height: '300px' }}>
                {/* 총 예산 대비 집행률 */}
                <div className="d-flex flex-column align-items-center" style={{ width: '33.3%', height: '100%' }}>
                    <p style={{ fontWeight: 'bold' }}>총 예산 대비 집행률</p>
                    <div className="progress dashboard-progress">
                        <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${data.budgetData}%`, backgroundColor: '#ea8685' }}></div>
                        <div className="d-flex dashboard-progress-text">
                            {data.budgetData}% / 100%
                        </div>
                    </div>
                </div>
                {/* 항목별 지출 비중 파이 차트 */}
                <div style={{ width: '33.3%', height: '100%' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0' }}>항목별 지출 비중</p>
                    {data.categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data.categoryData.map(item => ({
                                        ...item,
                                        fill: getOfficeColor(item.name)
                                    }))} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    outerRadius={75} 
                                    labelLine={false} 
                                    label={renderCustomLabel}
                                />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            데이터가 존재하지 않습니다.
                        </div>
                    )}
                </div>

                {/* 부서별 사용 예산 도넛 차트 영역 */}
                <div style={{ width: '33.3%', height: '100%' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0' }}>부서별 사용 예산</p>
                    {data.deptData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data.deptData.map(item => ({
                                        ...item,
                                        fill: getOfficeColor(item.name)
                                    }))}  
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={30}
                                    outerRadius={75} 
                                    labelLine={false} 
                                    label={renderCustomLabel}
                                />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            데이터가 존재하지 않습니다.
                        </div>
                    )}
                </div>

            </div>
            </div>
            </div>
        </main>
    )
}

export default AdminComponent;
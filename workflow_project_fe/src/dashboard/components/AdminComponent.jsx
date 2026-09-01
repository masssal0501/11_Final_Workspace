import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Sector } from 'recharts';
import { selectAdminDashboardApi } from "../api/dashboardApi";
import "../css/dashboard.css"

function AdminComponent() {
    
    // 상단/중단 요약 통계 데이터
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
        waitingList: [],
        monthlyData: [],
        shareData: []
    });

    // 항목별 지출 비중 데이터
    const [categoryData, setCategoryData] = useState([
        { name: '숙박비', value: 55, color: '#45eed8' },
        { name: '식비', value: 25, color: '#fa6666' },
        { name: '기타', value: 15, color: '#ffd094' },
        { name: '교통비', value: 5, color: '#70ff70' },
    ]);

    // 부서별 사용 예산 TOP 데이터
    const [deptData, setDeptData] = useState([
        { name: '영업팀', value: 30, color: '#9efb8b' },
        { name: '운영팀', value: 22, color: '#fb8ce2' },
        { name: '기획팀', value: 20, color: '#5680f9' },
        { name: '기타', value: 18, color: '#6ad2ff' },
        { name: '개발팀', value: 10, color: '#fdd885' },
    ]);

    // 예산 집행률용
    const [budgetData, setBudgetData] = useState({ used: 0, total: 100 });
    
    // 백엔드 API 호출 (Spring Boot 등 컨트롤러의 @GetMapping("/api/dashBoardApi") 와 매핑)
    useEffect(() => {
        const selectDashboardData = async () => {
            try {
                const response = await selectAdminDashboardApi();
                
                console.log(response);

                // 백엔드에서 넘어온 데이터로 상태 업데이트
  
                setData(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        
        selectDashboardData();
    }, []);

    // 거점 오피스별 데이터의 전체 합계 계산
    const totalShareValue = data.shareData.reduce((sum, item) => sum + (item.value || 0), 0);

    const getOfficeColor = (name) => {
        if (name === '강원') return '#ff8042';
        if (name === '제주') return '#8884d8';
        if (name === '부산') return '#00C49F';
        return '#8884d8';
    };

    // 라벨 렌더링 함수
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-midAngle * RADIAN);
        const cos = Math.cos(-midAngle * RADIAN);

        const percent = totalShareValue > 0 ? Math.round((value / totalShareValue) * 100) : 0;

        // 15% 이하일 때 바깥쪽 지시선 표시
        if (percent <= 15) {
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
                        {`${name} ${percent}%`}
                    </text>
                </g>
            );
        } else {
            // 15% 초과일 때 안쪽 글씨 표시
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * cos;
            const y = cy + radius * sin;

            return (
                <text x={x} y={y} fill="#333" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    {`${name} ${percent}%`}
                </text>
            );
        }
    };

    return(
        <div className="content">
            <div className="admin-dashboard-1" align="center">이번달 워케이션 현황</div>
            <br />
            <div className="d-flex justify-content-between admin-dashboard-3">
                <p>총 신청 건수 : { data.totalApply }건</p>
                <p>승인대기 : { data.waiting }건</p>
                <p>현재 진행중 : { data.inProgress }건</p>
                <p>예산 소진율 : { data.budgetExhaustionRate }%</p>
            </div>
            <br /><br />
            <div className="d-flex text-center admin-dashboard-1">
                <p className="w-50 mb-0">승인대기 목록</p>
                <p className="w-50 mb-0">지역별 이용 통계</p>
            </div>
            <br />
            <div className="d-flex text-center">
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
                <div className="d-flex w-50 admin-dashboard-3">
                    <p>제주 : xx%</p>
                    <p>강원 : xx%</p>
                    <p>부산 : xx%</p>
                </div>
            </div>
            <br /><br /><br /><br />
            <div className="admin-dashboard-1" align="center">공지사항</div>
            <div className="admin-dashboard-4">
                <div>게시판 제목 ~~~~</div>
                <div>게시판 제목 ~~~~</div>
                <div>게시판 제목 ~~~~</div>
            </div>
            <br /><br />
            <div className="admin-dashboard-1" align="center">워케이션 통계</div>
            <br />
            <div className="d-flex justify-content-between admin-dashboard-3">
                <p>총 참여 인원 : { data.totalParticipants } 명</p>
                <p>총 집행 예산 : { data.totalBudget }원</p>
                <p>평균 만족도 : { data.avgSatisfaction } / 5.0</p>                
            </div>
            <div className="d-flex justify-content-between admin-dashboard-3">
                <p>평균 워케이션 기간 : { data.avgDuration }일</p>
                <p>보유 지원금 : { data.supportFund }원</p>
                <p>워케이션 이용률 : { data.usageRate }%</p>
            </div>
            <br /><hr />
            <div className="d-flex text-center admin-dashboard-1">
                <p className="w-50 mb-0">월별 참가 현황</p>
                <p className="w-50 mb-0">거점 오피스별 점유율</p>
            </div>
           <div className="d-flex text-center py-3" style={ { height: '300px' } }>
                <div className="w-50 h-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.monthlyData.map(item => ({ ...item, name: `${item.name}월` }))}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#333333" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-50 h-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data.shareData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={100} 
                                labelLine={false} 
                                label={renderCustomLabel}
                                shape={(props) => <Sector {...props} fill={getOfficeColor(props.payload.name) || props.payload.color} />}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <br /><br />
            <div className="admin-dashboard-1" align="center">예산</div>
            <div className="d-flex text-center py-4" style={{ height: '300px' }}>
                
                {/* 총 예산 대비 집행률 */}
                <div style={{ width: '33.3%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ fontWeight: 'bold' }}>총 예산 대비 집행률</p>
                    
                    {/* 바깥쪽 회색 배경 */}
                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '24px',
                        backgroundColor: '#f0f0f0', 
                        marginTop: '10px'
                    }}>
                        {/* 안쪽 붉은색 채우기*/}
                        <div style={{ 
                            width: `${budgetData.used}%`,
                            height: '100%',
                            backgroundColor: '#ea8685' 
                        }}></div>

                        {/* 텍스트 영역 */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black',
                            fontSize: '14px'
                        }}>
                            {budgetData.used}% / 100%
                        </div>
                    </div>
                </div>

                {/* 2. 항목별 지출 비중 */}
                <div style={{ width: '33.3%', height: '100%' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0' }}>항목별 지출 비중</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={categoryData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={75} 
                                labelLine={false} 
                                label={renderCustomLabel}
                                shape={(props) => <Sector {...props} fill={props.payload.color} />}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. 부서별 사용 예산 TOP (도넛 차트: innerRadius 속성 추가) */}
                <div style={{ width: '33.3%', height: '100%' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0' }}>부서별 사용 예산 TOP</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={deptData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={30}
                                outerRadius={75} 
                                labelLine={false} 
                                label={renderCustomLabel}
                                shape={(props) => <Sector {...props} fill={getOfficeColor(props.payload.color)} />}
                            />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    )
}

export default AdminComponent;
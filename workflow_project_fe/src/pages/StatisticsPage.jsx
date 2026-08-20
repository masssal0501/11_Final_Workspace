import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { amountApi } from '../common/api/amountApi';


export default function StatisticsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 백엔드에서 통계 데이터를 한 번에 가져오는 API (예시: /api/admin/statistics)
        const data = await amountApi.getStatisticsData();
        setStats(data);
      } catch (e) {
        console.error("통계 데이터를 가져오는 데 실패했습니다.", e);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="amount-container">통계 데이터를 불러오는 중입니다...</div>;

  return (
    <div className="amount-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📊 비용 정산 통계 대시보드</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>목록으로 돌아가기</button>
      </div>

      {/* 1. 핵심 요약 지표 (카드 4개) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <StatCard title="누적 승인 금액" value={`${stats.totalApproved?.toLocaleString()}원`} />
        <StatCard title="누적 지원 금액" value={`${stats.totalSponsor?.toLocaleString()}원`} />
        <StatCard title="평균 승인 금액" value={`${stats.avgApproved?.toLocaleString()}원`} />
        <StatCard title="평균 지원 금액" value={`${stats.avgSponsor?.toLocaleString()}원`} />
      </div>

      {/* 2. 상태 현황 지표 (카드 3개) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <StatCard title="진행중인 건수" value={`${stats.pendingCount}건`} color="#ffc107" />
        <StatCard title="총 참여 인원" value={`${stats.totalParticipants}명`} color="#17a2b8" />
        <StatCard title="총 신청 건수" value={`${stats.totalCount}건`} color="#6c757d" />
      </div>

      {/* 3. 차트 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
          <h4>부서별 사용 예산</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="deptName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
          <h4>항목별 지출 내역</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.itemData} dataKey="value" nameKey="name" label>
                {stats.itemData.map((entry, index) => <Cell key={index} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 월별 참가 현황 */}
      <div className="card" style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '8px' }}>
        <h4>월별 참가 현황</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="participants" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 간단한 통계 카드 컴포넌트
function StatCard({ title, value, color = "#333" }) {
  return (
    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', borderLeft: `5px solid ${color}`, textAlign: 'center' }}>
      <div style={{ fontSize: '13px', color: '#666' }}>{title}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>{value}</div>
    </div>
  );
}
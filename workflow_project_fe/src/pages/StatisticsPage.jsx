import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { amountApi } from '../common/api/amountApi';

export default function StatisticsPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);

  // =========================================================
  // 항목 타입 코드 → 한글 이름
  // =========================================================
  const ITEM_TYPE_NAME = {
    S: '숙박',
    T: '교통',
    E: '식비',
    F: '체험',
    V: '공간대여',
    O: '기타'
  };

  // =========================================================
  // 통계 데이터 조회
  // =========================================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await amountApi.getStatisticsData();

        console.log('📊 통계 API 전체 응답:', data);
        console.log(
          '📊 통계 API 응답 key:',
          Object.keys(data || {})
        );

        console.log(
          '📊 실제 통계 데이터:',
          data
        );

        console.log(
          '📊 summary:',
          data?.summary
        );

        console.log(
          '📊 부서별 통계:',
          data?.deptStatistics
        );

        console.log(
          '📊 월별 통계:',
          data?.monthlyStatistics
        );

        console.log(
          '📊 항목별 통계:',
          data?.itemStatistics
        );

        setStats(data);

      } catch (e) {
        console.error(
          '통계 데이터를 가져오는 데 실패했습니다.',
          e
        );
      }
    };

    fetchStats();
  }, []);

  // =========================================================
  // 로딩
  // =========================================================
  if (!stats) {
    return (
      <div className="amount-container">
        통계 데이터를 불러오는 중입니다...
      </div>
    );
  }

  // =========================================================
  // API 응답 데이터 분리
  //
  // 실제 API 응답:
  //
  // {
  //   summary: {...},
  //   deptStatistics: [...],
  //   monthlyStatistics: [...],
  //   itemStatistics: [...]
  // }
  // =========================================================

  const summary = stats.summary || {};

  const deptStatistics =
    stats.deptStatistics || [];

  const monthlyStatistics =
    stats.monthlyStatistics || [];

  const itemStatistics =
    stats.itemStatistics || [];

  // =========================================================
  // 원 → 만원
  //
  // 예:
  // 110000 → 11
  // 27500 → 2.75
  // =========================================================
  const toManWon = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    const number = Number(value);

    if (isNaN(number)) {
      return 0;
    }

    return number / 10000;
  };

  // =========================================================
  // 금액 표시
  // =========================================================
  const formatMoney = (value) => {
    return toManWon(value).toLocaleString(
      'ko-KR',
      {
        maximumFractionDigits: 2
      }
    );
  };

  // =========================================================
  // Y축 숫자 포맷
  // =========================================================
  const formatYAxis = (value) => {
    return Number(value).toLocaleString();
  };

  // =========================================================
  // 금액 Tooltip
  // =========================================================
  const formatTooltipMoney = (value) => {
    return [
      `${formatMoney(value * 10000)} 만원`,
      '금액'
    ];
  };

  // =========================================================
  // 항목별 지출 데이터
  //
  // API:
  //
  // itemStatistics: [
  //   {
  //     itemType: 'S',
  //     amount: 100000
  //   }
  // ]
  // =========================================================
  const itemData = itemStatistics.map((item) => {
    const type = item.itemType;

    return {
      name: ITEM_TYPE_NAME[type] || type,
      value: Number(item.amount) || 0
    };
  });

  console.log(
    '📊 Pie Chart 변환 데이터:',
    itemData
  );

  // =========================================================
  // Pie Chart 전체 금액
  // =========================================================
  const totalItemAmount = itemData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  // =========================================================
  // Pie Chart 비율 데이터
  // =========================================================
  const pieData = itemData.map((item) => ({
    ...item,

    percent:
      totalItemAmount > 0
        ? (item.value / totalItemAmount) * 100
        : 0
  }));

  console.log(
    '📊 Pie Chart 최종 데이터:',
    pieData
  );

  // =========================================================
  // 부서별 차트 데이터
  //
  // 원 → 만원으로 변환
  // =========================================================
  const deptChartData = deptStatistics.map(
    (item) => ({
      ...item,
      amount: toManWon(item.amount)
    })
  );

  console.log(
    '📊 부서별 Chart 데이터:',
    deptChartData
  );

  // =========================================================
  // 월별 차트 데이터
  // =========================================================
  const monthlyChartData =
    monthlyStatistics.map((item) => ({
      ...item,
      participants:
        Number(item.participants) || 0
    }));

  console.log(
    '📊 월별 Chart 데이터:',
    monthlyChartData
  );

  return (
    <div className="amount-container">

      {/* =====================================================
          헤더
      ====================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h2>
          📊 비용 정산 통계 대시보드

          <span
            style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: 'normal',
              marginLeft: '8px'
            }}
          >
            (단위: 만원)
          </span>
        </h2>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          목록으로 돌아가기
        </button>
      </div>


      {/* =====================================================
          금액 통계
      ====================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}
      >

        {/* 누적 승인 금액 */}
        <StatCard
          title="누적 승인 금액"
          value={`${formatMoney(
            summary.totalApproved
          )}만원`}
        />

        {/* 누적 지원 금액 */}
        <StatCard
          title="누적 지원 금액"
          value={`${formatMoney(
            summary.totalSponsor
          )}만원`}
        />

        {/* 평균 승인 금액 */}
        <StatCard
          title="평균 승인 금액"
          value={`${formatMoney(
            summary.avgApproved
          )}만원`}
        />

        {/* 평균 지원 금액 */}
        <StatCard
          title="평균 지원 금액"
          value={`${formatMoney(
            summary.avgSponsor
          )}만원`}
        />

      </div>


      {/* =====================================================
          건수 통계
      ====================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}
      >

        {/* 진행중인 건수 */}
        <StatCard
          title="진행중인 건수"
          value={`${summary.pendingCount ?? 0}건`}
          color="#ffc107"
        />

        {/* 총 참여 인원 */}
        <StatCard
          title="총 참여 인원"
          value={`${summary.totalParticipants ?? 0}명`}
          color="#17a2b8"
        />

        {/* 총 신청 건수 */}
        <StatCard
          title="총 신청 건수"
          value={`${summary.totalCount ?? 0}건`}
          color="#6c757d"
        />

      </div>


      {/* =====================================================
          차트 영역
      ====================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '20px'
        }}
      >


        {/* ===================================================
            부서별 사용 예산
        ==================================================== */}
        <div
          className="card"
          style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '8px'
          }}
        >

          <h4>
            부서별 사용 예산
          </h4>

          {deptChartData.length === 0 ? (

            <div
              style={{
                height: '250px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999'
              }}
            >
              부서별 통계 데이터가 없습니다.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={250}
            >
              <BarChart
                data={deptChartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="deptName"
                />

                <YAxis
                  tickFormatter={
                    formatYAxis
                  }
                  width={60}
                />

                <Tooltip
                  formatter={
                    formatTooltipMoney
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#8884d8"
                />

              </BarChart>
            </ResponsiveContainer>

          )}

        </div>


        {/* ===================================================
            항목별 지출 비율
        ==================================================== */}
        <div
          className="card"
          style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '8px'
          }}
        >

          <h4>
            항목별 지출 비율
          </h4>

          {pieData.length === 0 ? (

            <div
              style={{
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#999'
              }}
            >
              항목별 통계 데이터가 없습니다.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                >

                  {pieData.map(
                    (entry, index) => (

                      <Cell
                        key={`cell-${index}`}
                        fill={[
                          '#0088FE',
                          '#00C49F',
                          '#FFBB28',
                          '#FF8042',
                          '#8884D8',
                          '#df003f'
                        ][index % 6]}
                      />

                    )
                  )}

                </Pie>


                {/* =================================================
                    마우스 Hover 시 비율 표시
                ================================================== */}
                <Tooltip
                  formatter={(
                    value,
                    name
                  ) => {

                    const percent =
                      totalItemAmount > 0
                        ? (
                            (Number(value) /
                              totalItemAmount) *
                            100
                          ).toFixed(1)
                        : '0.0';

                    return [
                      `${percent}%`,
                      name
                    ];
                  }}
                />


                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>


      {/* =====================================================
          월별 참가 현황
      ====================================================== */}
      <div
        className="card"
        style={{
          marginTop: '20px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px'
        }}
      >

        <h4>
          월별 참가 현황
        </h4>

        {monthlyChartData.length === 0 ? (

          <div
            style={{
              height: '200px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#999'
            }}
          >
            월별 참가 통계 데이터가 없습니다.
          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={200}
          >

            <LineChart
              data={monthlyChartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value) => [
                  `${value}명`,
                  '참가 인원'
                ]}
              />

              <Line
                type="monotone"
                dataKey="participants"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{
                  r: 4
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>
  );
}


// =========================================================
// 통계 카드
// =========================================================
function StatCard({
  title,
  value,
  color = '#333'
}) {

  return (

    <div
      style={{
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        borderLeft:
          `5px solid ${color}`,
        textAlign: 'center'
      }}
    >

      <div
        style={{
          fontSize: '13px',
          color: '#666'
        }}
      >
        {title}
      </div>


      <div
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginTop: '5px'
        }}
      >
        {value}
      </div>

    </div>

  );
}
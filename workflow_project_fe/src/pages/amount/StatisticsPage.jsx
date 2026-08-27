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

import { amountApi } from '../../amount/api/amountApi';

export default function StatisticsPage() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // =========================================================
  // DB amount_item.item_type 기준
  //
  // S = 숙박
  // T = 교통
  // E = 체험
  // F = 식비
  // V = 차량
  // O = 기타
  // =========================================================

  const ITEM_TYPE_NAME = {
    S: '숙박',
    T: '교통',
    E: '체험',
    F: '식비',
    V: '차량',
    O: '기타'
  };


  // =========================================================
  // 통계 데이터 조회
  // =========================================================

  useEffect(() => {

    const fetchStats = async () => {

      try {

        setLoading(true);
        setError(null);

        const data =
          await amountApi.getStatisticsData();

        console.log(
          '📊 비용 통계 전체 응답:',
          data
        );

        console.log(
          '📊 summary:',
          data?.summary
        );

        console.log(
          '📊 deptStatistics:',
          data?.deptStatistics
        );

        console.log(
          '📊 monthlyStatistics:',
          data?.monthlyStatistics
        );

        console.log(
          '📊 itemStatistics:',
          data?.itemStatistics
        );

        setStats(data || {});

      } catch (e) {

        console.error(
          '통계 데이터를 가져오는 데 실패했습니다.',
          e
        );

        setError(
          e.response?.data?.message ||
          e.response?.data ||
          '통계 데이터를 불러오지 못했습니다.'
        );

      } finally {

        setLoading(false);

      }

    };

    fetchStats();

  }, []);


  // =========================================================
  // 로딩
  // =========================================================

  if (loading) {

    return (

      <div className="amount-container">

        <div
          style={{
            padding: '50px',
            textAlign: 'center',
            color: '#666'
          }}
        >
          통계 데이터를 불러오는 중입니다...
        </div>

      </div>

    );

  }


  // =========================================================
  // 오류
  // =========================================================

  if (error) {

    return (

      <div className="amount-container">

        <div
          style={{
            padding: '40px',
            textAlign: 'center'
          }}
        >

          <h3>
            통계 데이터를 불러오지 못했습니다.
          </h3>

          <p
            style={{
              color: '#d9534f'
            }}
          >
            {error}
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            돌아가기
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // API 데이터
  // =========================================================

  const summary =
    stats?.summary || {};

  const deptStatistics =
    Array.isArray(stats?.deptStatistics)
      ? stats.deptStatistics
      : [];

  const monthlyStatistics =
    Array.isArray(stats?.monthlyStatistics)
      ? stats.monthlyStatistics
      : [];

  const itemStatistics =
    Array.isArray(stats?.itemStatistics)
      ? stats.itemStatistics
      : [];


  // =========================================================
  // 숫자 변환
  // =========================================================

  const toNumber = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    const number =
      Number(value);

    return Number.isFinite(number)
      ? number
      : 0;

  };


  // =========================================================
  // 원 → 만원
  // =========================================================

  const toManWon = (value) => {

    return toNumber(value) / 10000;

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
  // Y축 숫자
  // =========================================================

  const formatYAxis = (value) => {

    return Number(value).toLocaleString(
      'ko-KR',
      {
        maximumFractionDigits: 2
      }
    );

  };


  // =========================================================
  // 부서별 사용 예산
  //
  // getDeptStatistics()
  //
  // deptName
  // amount
  //
  // amount = 승인 금액
  // =========================================================

  const deptChartData =
    deptStatistics.map((item) => ({

      deptName:
        item.deptName ||
        '미지정',

      amount:
        toManWon(item.amount)

    }));


  // =========================================================
  // 항목별 지출
  //
  // DB
  //
  // amount_item.cost
  //        ↓
  // getItemStatistics()
  //        ↓
  // itemType / amount
  //        ↓
  // PieChart
  //
  // ※ 백엔드에서 SUM(cost) AS amount 로 내려준다는 전제
  // =========================================================

  const itemData =
    itemStatistics.map((item) => {

      const type =
        item.itemType;

      return {

        name:
          ITEM_TYPE_NAME[type] ||
          type ||
          '기타',

        value:
          toNumber(item.amount)

      };

    });


  console.log(
    '📊 항목별 Pie 데이터:',
    itemData
  );


  // =========================================================
  // 항목별 전체 금액
  // =========================================================

  const totalItemAmount =
    itemData.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );


  // =========================================================
  // Pie 데이터
  // =========================================================

  const pieData =
    itemData.map((item) => ({

      ...item,

      percent:
        totalItemAmount > 0
          ? (
              item.value /
              totalItemAmount
            ) * 100
          : 0

    }));


  // =========================================================
  // 월별 참가 현황
  //
  // month
  // participants
  // =========================================================

  const monthlyChartData =
    monthlyStatistics.map((item) => ({

      month:
        item.month || '-',

      participants:
        toNumber(item.participants)

    }));


  console.log(
    '📊 월별 참가 데이터:',
    monthlyChartData
  );


  // =========================================================
  // 부서별 Tooltip
  // =========================================================

  const formatDeptTooltip = (value) => {

    return [

      `${Number(value).toLocaleString(
        'ko-KR',
        {
          maximumFractionDigits: 2
        }
      )} 만원`,

      '승인 금액'

    ];

  };


  // =========================================================
  // Pie Tooltip
  // =========================================================

  const formatPieTooltip = (
    value,
    name
  ) => {

    const percent =
      totalItemAmount > 0
        ? (
            Number(value) /
            totalItemAmount
          ) * 100
        : 0;

    return [

      `${percent.toFixed(1)}%`,

      name

    ];

  };


  // =========================================================
  // Pie 색상
  // =========================================================

  const PIE_COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#df003f'
  ];


  // =========================================================
  // 화면
  // =========================================================

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
            (금액 단위: 만원)
          </span>

        </h2>


        <button
          type="button"
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

        <StatCard
          title="누적 승인 금액"
          value={
            `${formatMoney(
              summary.totalApproved
            )}만원`
          }
        />


        <StatCard
          title="누적 지원 금액"
          value={
            `${formatMoney(
              summary.totalSponsor
            )}만원`
          }
        />


        <StatCard
          title="평균 승인 금액"
          value={
            `${formatMoney(
              summary.avgApproved
            )}만원`
          }
        />


        <StatCard
          title="평균 지원 금액"
          value={
            `${formatMoney(
              summary.avgSponsor
            )}만원`
          }
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

        <StatCard
          title="진행중인 건수"
          value={
            `${summary.pendingCount ?? 0}건`
          }
          color="#ffc107"
        />


        <StatCard
          title="총 참여 인원"
          value={
            `${summary.totalParticipants ?? 0}명`
          }
          color="#17a2b8"
        />


        <StatCard
          title="총 신청 건수"
          value={
            `${summary.totalCount ?? 0}건`
          }
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
            부서별 승인 금액
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
            부서별 승인 금액
          </h4>


          {deptChartData.length === 0 ? (

            <EmptyChart
              message="부서별 통계 데이터가 없습니다."
              height="250px"
            />

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
                    formatDeptTooltip
                  }
                />

                <Bar
                  dataKey="amount"
                  fill="#8884d8"
                  name="승인 금액"
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

            <EmptyChart
              message="항목별 통계 데이터가 없습니다."
              height="300px"
            />

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
                  label={({ name, percent }) =>
                    `${name} ${percent.toFixed(1)}%`
                  }
                >

                  {pieData.map(
                    (entry, index) => (

                      <Cell
                        key={
                          `cell-${index}`
                        }
                        fill={
                          PIE_COLORS[
                            index %
                            PIE_COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>


                <Tooltip
                  formatter={
                    formatPieTooltip
                  }
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

          <EmptyChart
            message="월별 참가 통계 데이터가 없습니다."
            height="200px"
          />

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


      {/* =====================================================
          통계 기준 안내
      ====================================================== */}

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666'
        }}
      >

        <div>
          ※ 누적/평균 승인 금액은 승인 상태(A)인 비용 신청을 기준으로 합니다.
        </div>

        <div>
          ※ 항목별 지출은 amount_item.cost 기준입니다.
        </div>

        <div>
          ※ 지원 금액은 amount_list.amount 기준입니다.
        </div>

        <div>
          ※ 월별 참가 인원은 workcation_info의 사원 기준으로 집계합니다.
        </div>

      </div>

    </div>

  );

}


// =========================================================
// 빈 차트
// =========================================================

function EmptyChart({
  message,
  height
}) {

  return (

    <div
      style={{
        height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#999'
      }}
    >
      {message}
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
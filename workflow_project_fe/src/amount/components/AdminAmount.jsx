import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AdminAmount() {

  console.log('🔥🔥 AdminAmount 컴포넌트 실행');

  const navigate = useNavigate();

  const [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(true);


  // =========================================================
  // 현재 상태 확인
  // =========================================================

  console.log('🔥 현재 loading:', loading);
  console.log('🔥 현재 amounts:', amounts);
  console.log('🔥 현재 amounts length:', amounts.length);


  // =========================================================
  // 관리자 전체 비용 신청 목록 조회
  // =========================================================

  const fetchAmountList = async () => {

    console.log('🔥 fetchAmountList 시작');

    try {

      setLoading(true);

      console.log('🔥 관리자 전체 비용 목록 API 호출');

      const data = await amountApi.getAmountList();

      console.log(
        '📋 관리자 전체 정산 신청 목록:',
        data
      );


      // =====================================================
      // 서버 응답 구조
      //
      // {
      //   pageLimit: 5,
      //   startPage: 1,
      //   boardLimit: 10,
      //   limit: 10,
      //   page: 1,
      //   endPage: 1,
      //   maxPage: 1,
      //   listCount: 5,
      //   list: [...]
      // }
      // =====================================================

      let list = [];


      if (Array.isArray(data)) {

        list = data;

      } else if (Array.isArray(data?.list)) {

        list = data.list;

      }


      console.log(
        '📋 관리자 정산 신청 목록:',
        list
      );

      console.log(
        '📋 관리자 정산 신청 개수:',
        list.length
      );


      // =====================================================
      // 개별 데이터 확인
      // =====================================================

      list.forEach((amount, index) => {

        console.log(
          `===== 정산 데이터 ${index + 1} =====`
        );

        console.log(
          '신청번호:',
          amount.amountNo
        );

        console.log(
          '사원명:',
          amount.empName
        );

        console.log(
          '워케이션 번호:',
          amount.workcationNo
        );

        console.log(
          '신청금액:',
          amount.requestedAmount
        );

        console.log(
          '승인금액:',
          amount.approvedAmount
        );

        console.log(
          '상태:',
          amount.status
        );

        console.log(
          '신청일:',
          amount.requestedAt
        );

      });


      // =====================================================
      // 상태 저장
      // =====================================================

      setAmounts(list);

      console.log(
        '🔥 setAmounts 실행 완료'
      );

    } catch (error) {

      console.error(
        '❌ 관리자 정산 신청 목록 조회 실패:',
        error
      );

      console.error(
        '❌ 서버 응답:',
        error.response?.data
      );

      console.error(
        '❌ HTTP 상태:',
        error.response?.status
      );

      setAmounts([]);

    } finally {

      console.log(
        '🔥 fetchAmountList finally'
      );

      setLoading(false);

    }

  };


  // =========================================================
  // 최초 진입
  // =========================================================

  useEffect(() => {

    console.log(
      '🔥🔥 AdminAmount useEffect 실행'
    );

    fetchAmountList();

  }, []);


  // =========================================================
  // 날짜 포맷
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return '-';
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return '-';
    }

    const year =
      d.getFullYear();

    const month =
      String(d.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(d.getDate())
        .padStart(2, '0');

    return `${year}-${month}-${day}`;

  };


  // =========================================================
  // 금액 포맷
  // =========================================================

  const formatMoney = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '-';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return '-';
    }

    return `${number.toLocaleString('ko-KR')} 원`;

  };


  // =========================================================
  // 상태 배지
  // =========================================================

  const getStatusBadge = (status) => {

    const statusMap = {

      R: '검토중',
      A: '승인됨',
      J: '반려됨',
      H: '보류됨',
      C: '취소됨'

    };


    return (
      <span
        className={`status-badge status-${status}`}
      >
        {statusMap[status] || status || '-'}
      </span>
    );

  };


  // =========================================================
  // 결재 처리
  // =========================================================

  const handleApproval = async (
    e,
    item,
    status
  ) => {

    // 행 클릭 방지
    e.stopPropagation();


    let comment = '';
    let approvedAmount = 0;


    // =======================================================
    // 보류 / 반려
    // =======================================================

    if (
      status === 'H' ||
      status === 'J'
    ) {

      const reasonTitle =
        status === 'H'
          ? '보류 사유를 입력하세요.'
          : '반려 사유를 입력하세요.';


      const inputComment =
        window.prompt(reasonTitle);


      // 취소
      if (inputComment === null) {
        return;
      }


      comment =
        inputComment.trim();


      // 빈 값
      if (!comment) {

        alert(
          status === 'H'
            ? '보류 사유를 입력해주세요.'
            : '반려 사유를 입력해주세요.'
        );

        return;

      }

    }


    // =======================================================
    // 승인
    // =======================================================

    if (status === 'A') {

      const inputAmt =
        window.prompt(
          '승인 금액을 입력하세요:',
          item.approvedAmount ??
          item.requestedAmount ??
          0
        );


      // 취소
      if (inputAmt === null) {
        return;
      }


      const cleanAmount =
        String(inputAmt)
          .replace(/,/g, '')
          .trim();


      approvedAmount =
        Number(cleanAmount);


      // 금액 검증
      if (
        cleanAmount === '' ||
        Number.isNaN(approvedAmount) ||
        approvedAmount < 0
      ) {

        alert(
          '올바른 금액을 입력해 주세요.'
        );

        return;

      }


      // =====================================================
      // 신청 금액보다 많이 승인할 수 없음
      // =====================================================

      const requestedAmount =
        Number(
          item.requestedAmount
        ) || 0;


      if (
        approvedAmount >
        requestedAmount
      ) {

        alert(
          `승인 금액(${approvedAmount.toLocaleString()}원)은 ` +
          `신청 금액(${requestedAmount.toLocaleString()}원)을 ` +
          `초과할 수 없습니다.`
        );

        return;

      }

    }


    // =======================================================
    // 서버 요청
    // =======================================================

    try {

      console.log(
        '================================'
      );

      console.log(
        '===== 정산 결재 처리 ====='
      );

      console.log(
        'amountNo:',
        item.amountNo
      );

      console.log(
        'status:',
        status
      );

      console.log(
        'approvedAmount:',
        approvedAmount
      );

      console.log(
        'comment:',
        comment
      );

      console.log(
        '================================'
      );


      await amountApi.updateApproval(
        item.amountNo,
        status,
        approvedAmount,
        comment
      );


      // =====================================================
      // 완료 메시지
      // =====================================================

      const statusMessage = {

        A: '승인 처리가 완료되었습니다.',
        H: '보류 처리가 완료되었습니다.',
        J: '반려 처리가 완료되었습니다.'

      };


      alert(
        statusMessage[status] ||
        '결재 처리가 완료되었습니다.'
      );


      // =====================================================
      // 목록 새로고침
      // =====================================================

      await fetchAmountList();


    } catch (error) {

      console.error(
        '❌ 결재 처리 실패:',
        error
      );

      console.error(
        '❌ 서버 응답:',
        error.response?.data
      );

      console.error(
        '❌ HTTP 상태:',
        error.response?.status
      );


      alert(
        error.response?.data?.message ||
        error.response?.data ||
        '결재 처리에 실패했습니다.'
      );

    }

  };


  // =========================================================
  // 로딩 화면
  // =========================================================

  if (loading) {

    console.log(
      '⏳ 관리자 비용 목록 로딩 중'
    );


    return (

      <div className="amount-container">

        <div
          style={{
            padding: '40px',
            textAlign: 'center'
          }}
        >
          정산 신청 목록을 불러오는 중입니다...
        </div>

      </div>

    );

  }


  // =========================================================
  // 로딩 완료 후 렌더링 확인
  // =========================================================

  console.log(
    '🔥🔥 화면 렌더링 amounts:',
    amounts
  );

  console.log(
    '🔥🔥 amounts length:',
    amounts.length
  );


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
          marginBottom: '15px'
        }}
      >

        <h2
          className="amount-title"
          style={{
            margin: 0
          }}
        >
          비용 정산 결재 관리 (관리자)
        </h2>


        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate('/admin/statistics')
          }
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 정산 통계 보기
        </button>

      </div>


      {/* =====================================================
          전체 정산 신청 목록
      ====================================================== */}

      <table className="amount-table">

        <thead>

          <tr className="admin-table-header">

            <th className="text-center">
              신청번호
            </th>

            <th className="text-center">
              사원명
            </th>

            <th className="text-right">
              신청 금액
            </th>

            <th className="text-right">
              승인 금액
            </th>

            <th className="text-center">
              상태
            </th>

            <th className="text-center">
              신청일
            </th>

            <th className="text-center">
              결재 처리
            </th>

          </tr>

        </thead>


        <tbody>

          {/* =================================================
              데이터 없음
          ================================================== */}

          {amounts.length === 0 ? (

            <tr>

              <td
                colSpan="7"
                className="text-center"
              >
                정산 신청 내역이 없습니다.
              </td>

            </tr>

          ) : (

            /* ===============================================
               데이터 출력
            ================================================ */

            amounts.map((item) => (

              <tr
                key={item.amountNo}
                onClick={() =>
                  navigate(
                    `/cost/detail/${item.amountNo}`
                  )
                }
                style={{
                  cursor: 'pointer'
                }}
              >


                {/* 신청번호 */}

                <td className="text-center">

                  {item.amountNo}

                </td>


                {/* 사원명 */}

                <td className="text-center">

                  {item.empName || '-'}

                </td>


                {/* 신청 금액 */}

                <td className="text-right">

                  {formatMoney(
                    item.requestedAmount
                  )}

                </td>


                {/* 승인 금액 */}

                <td className="text-right">

                  {
                    item.approvedAmount !== null &&
                    item.approvedAmount !== undefined
                      ? formatMoney(
                          item.approvedAmount
                        )
                      : '-'
                  }

                </td>


                {/* 상태 */}

                <td className="text-center">

                  {getStatusBadge(
                    item.status
                  )}

                </td>


                {/* 신청일 */}

                <td className="text-center">

                  {formatDate(
                    item.requestedAt
                  )}

                </td>


                {/* =================================================
                    결재 처리
                ================================================== */}

                <td className="text-center">

                  {
                    ['R', 'H'].includes(
                      item.status
                    ) ? (

                      <>


                        {/* 승인 */}

                        <button
                          type="button"
                          className="btn btn-approve"
                          onClick={(e) =>
                            handleApproval(
                              e,
                              item,
                              'A'
                            )
                          }
                        >
                          승인
                        </button>


                        {/* 반려 */}

                        <button
                          type="button"
                          className="btn btn-reject"
                          onClick={(e) =>
                            handleApproval(
                              e,
                              item,
                              'J'
                            )
                          }
                        >
                          반려
                        </button>


                        {/* 보류 */}

                        {
                          item.status === 'R' && (

                            <button
                              type="button"
                              className="btn btn-hold"
                              onClick={(e) =>
                                handleApproval(
                                  e,
                                  item,
                                  'H'
                                )
                              }
                            >
                              보류
                            </button>

                          )
                        }


                      </>

                    ) : (

                      <span className="text-disabled">

                        {
                          item.status === 'C'
                            ? '신청자 취소건'
                            : '처리 완료'
                        }

                      </span>

                    )
                  }

                </td>


              </tr>

            ))

          )}

        </tbody>

      </table>


    </div>

  );

}
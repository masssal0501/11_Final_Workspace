import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AdminAmount({ workcationNo }) {
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState([]);

  const fetchAmountList = async () => {
    try {
      const data = await amountApi.getAmountListByWorkcation(
        workcationNo || 1
      );

      setAmounts(data);
    } catch (error) {
      console.error('목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchAmountList();
  }, [workcationNo]);

  // =========================================================
  // 결재 처리
  // A = 승인
  // H = 보류
  // J = 반려
  // =========================================================
  const handleApproval = async (e, item, status) => {
    e.stopPropagation();

    let comment = '';
    let approvedAmount = null;

    // =====================================================
    // 1. 보류 / 반려일 경우 사유 필수 입력
    // =====================================================
    if (status === 'H' || status === 'J') {
      const reasonTitle =
        status === 'H'
          ? '보류 사유를 입력하세요.'
          : '반려 사유를 입력하세요.';

      const inputComment = prompt(reasonTitle);

      // 취소 버튼
      if (inputComment === null) {
        return;
      }

      comment = inputComment.trim();

      // 빈 값 방지
      if (!comment) {
        alert(
          status === 'H'
            ? '보류 사유를 입력해주세요.'
            : '반려 사유를 입력해주세요.'
        );
        return;
      }
    }

    // =====================================================
    // 2. 승인일 경우 승인 금액 입력
    // =====================================================
    if (status === 'A') {
      const inputAmt = prompt(
        '승인 금액을 입력하세요:',
        item.requestedAmount
      );

      // 취소
      if (inputAmt === null) {
        return;
      }

      // 콤마 제거
      const cleanAmount = String(inputAmt).replace(/,/g, '').trim();

      approvedAmount = Number(cleanAmount);

      // 숫자 검증
      if (
        cleanAmount === '' ||
        isNaN(approvedAmount) ||
        approvedAmount < 0
      ) {
        alert('올바른 금액을 입력해 주세요.');
        return;
      }

      // 신청금액 초과 방지
      if (approvedAmount > item.requestedAmount) {
        alert(
          `승인 금액(${approvedAmount.toLocaleString()}원)은 ` +
          `신청 금액(${item.requestedAmount.toLocaleString()}원)을 ` +
          `초과할 수 없습니다.`
        );
        return;
      }
    }

    // =====================================================
    // 3. 서버 요청
    // =====================================================
    try {
      console.log('===== 결재 처리 =====');
      console.log('amountNo:', item.amountNo);
      console.log('status:', status);
      console.log('approvedAmount:', approvedAmount);
      console.log('comment:', comment);

      await amountApi.updateApproval(
        item.amountNo,
        status,
        approvedAmount,
        comment
      );

      // 상태별 메시지
      const statusMessage = {
        A: '승인 처리가 완료되었습니다.',
        H: '보류 처리가 완료되었습니다.',
        J: '반려 처리가 완료되었습니다.'
      };

      alert(
        statusMessage[status] ||
        '결재 처리가 완료되었습니다.'
      );

      // 목록 새로고침
      fetchAmountList();

    } catch (error) {
      console.error('결재 처리 실패:', error);

      console.error(
        '서버 응답:',
        error.response?.data
      );

      alert(
        error.response?.data ||
        '결재 처리에 실패했습니다.'
      );
    }
  };

  // =========================================================
  // 상태 뱃지
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
      <span className={`status-badge status-${status}`}>
        {statusMap[status] || status}
      </span>
    );
  };

  return (
    <div className="amount-container">

      {/* =====================================================
          상단 헤더
      ===================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}
      >
        <h2
          className="amount-title admin"
          style={{ margin: 0 }}
        >
          비용 정산 결재 관리 (관리자)
        </h2>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/admin/statistics')}
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
          결재 목록
      ===================================================== */}
      <table className="amount-table">

        <thead>
          <tr className="admin-table-header">
            <th className="text-center">
              신청번호
            </th>

            <th className="text-right">
              신청 금액
            </th>

            <th className="text-right">
              총합산 금액
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

          {amounts.length === 0 ? (

            <tr>
              <td
                colSpan="6"
                className="text-center"
              >
                정산 신청 내역이 없습니다.
              </td>
            </tr>

          ) : (

            amounts.map((item) => {

              // =================================================
              // 1. 회사 승인 금액
              // =================================================
              const approvedAmt =
                item.approvedAmount || 0;

              // =================================================
              // 2. 해당 신청 건의 지원금 총합
              // =================================================
              const totalSponsorAmt =
                item.itemList?.reduce(
                  (sum, currentItem) => {

                    const itemSponsors =
                      currentItem.sponsorList || [];

                    return (
                      sum +
                      itemSponsors.reduce(
                        (sSum, sponsor) =>
                          sSum +
                          (sponsor.amount || 0),
                        0
                      )
                    );
                  },
                  0
                ) || 0;

              // =================================================
              // 3. 총합산 금액
              // =================================================
              const grandTotal =
                approvedAmt > 0
                  ? approvedAmt + totalSponsorAmt
                  : 0;

              return (
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

                  {/* 신청금액 */}
                  <td className="text-right">
                    {item.requestedAmount?.toLocaleString()}
                    {' '}원
                  </td>

                  {/* 총합산 금액 */}
                  <td className="text-right">
                    {grandTotal > 0
                      ? `${grandTotal.toLocaleString()} 원`
                      : '-'}
                  </td>

                  {/* 상태 */}
                  <td className="text-center">
                    {getStatusBadge(item.status)}
                  </td>

                  {/* 신청일 */}
                  <td className="text-center">
                    {item.requestedAt}
                  </td>

                  {/* 결재 처리 */}
                  <td className="text-center">

                    {/* =========================================
                        검토중(R) / 보류(H)
                        ========================================= */}
                    {['R', 'H'].includes(item.status) ? (

                      <>

                        {/* 승인 */}
                        <button
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
                        {item.status === 'R' && (
                          <button
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
                        )}

                      </>

                    ) : (

                      <span className="text-disabled">
                        {item.status === 'C'
                          ? '신청자 취소건'
                          : '처리 완료'}
                      </span>

                    )}

                  </td>
                </tr>
              );
            })
          )}

        </tbody>
      </table>
    </div>
  );
}
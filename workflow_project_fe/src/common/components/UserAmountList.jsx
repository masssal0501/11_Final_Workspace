import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function UserAmountList({ workcationNo }) {
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState([]);

  // =========================================================
  // 비용 신청 목록 조회
  // =========================================================
  const fetchAmountList = async () => {
    try {
      const data = await amountApi.getAmountListByWorkcation(
        workcationNo || 1
      );

      console.log('📌 비용 신청 목록:', data);

      setAmounts(data);
    } catch (error) {
      console.error('목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchAmountList();
  }, [workcationNo]);

  // =========================================================
  // 날짜 포맷
  // 2026-08-21T06:05:16.000Z
  //          ↓
  // 2026-08-21
  // =========================================================
  const formatDate = (date) => {
    if (!date) return '-';

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '-';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // 금액 포맷
  // =========================================================
  const formatMoney = (amount) => {
    if (amount === null || amount === undefined || amount === '') {
      return '-';
    }

    return `${Number(amount).toLocaleString()} 원`;
  };

  // =========================================================
  // 수정
  // =========================================================
  const handleEdit = (item) => {
    console.log('🔥 handleEdit 실행');
    console.log('수정할 item:', item);

    if (['A', 'J', 'C'].includes(item.status)) {
      alert('승인, 반려 또는 취소된 내역은 수정할 수 없습니다.');
      return;
    }

    navigate(`/cost/apply/${item.amountNo}`);
  };

  // =========================================================
  // 신청 취소
  // =========================================================
  const handleCancel = async (amountNo) => {
    if (
      !window.confirm(
        `[신청번호 ${amountNo}] 정산 신청을 취소하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      await amountApi.cancelAmount(amountNo);

      alert('신청이 취소되었습니다.');

      fetchAmountList();
    } catch (error) {
      console.error('취소 실패:', error);

      alert(
        error.response?.data ||
        '취소 처리에 실패했습니다.'
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

  // =========================================================
  // 화면
  // =========================================================
  return (
    <div className="amount-container">

      {/* =====================================================
          헤더
      ===================================================== */}
      <div className="amount-header">

        <h2 className="amount-title">
          내 비용 정산 신청 내역 (사원용)
        </h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/cost/apply')}
        >
          + 비용 신청하기
        </button>

      </div>

      {/* =====================================================
          신청 목록
      ===================================================== */}
      <table className="amount-table">

        <thead>
          <tr className="user-table-header">

            <th className="text-center">
              신청번호
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
              신청 관리
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
                신청 내역이 없습니다.
              </td>
            </tr>

          ) : (

            amounts.map((item) => (

              <tr key={item.amountNo}>

                {/* =========================================
                    신청번호
                ========================================= */}
                <td className="text-center">
                  {item.amountNo}
                </td>

                {/* =========================================
                    신청 금액
                ========================================= */}
                <td className="text-right">
                  {formatMoney(item.requestedAmount)}
                </td>

                {/* =========================================
                    승인 금액
                ========================================= */}
                <td className="text-right">
                  {item.approvedAmount !== null &&
                  item.approvedAmount !== undefined
                    ? formatMoney(item.approvedAmount)
                    : '-'}
                </td>

                {/* =========================================
                    상태
                ========================================= */}
                <td className="text-center">
                  {getStatusBadge(item.status)}
                </td>

                {/* =========================================
                    신청일
                    2026-08-21T06:05:16.000Z
                    → 2026-08-21
                ========================================= */}
                <td className="text-center">
                  {formatDate(item.requestedAt)}
                </td>

                {/* =========================================
                    신청 관리
                ========================================= */}
                <td className="text-center">

                  {['R', 'H'].includes(item.status) ? (

                    <>
                      <button
                        type="button"
                        className="btn btn-edit"
                        onClick={() => handleEdit(item)}
                      >
                        수정
                      </button>

                      <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={() =>
                          handleCancel(item.amountNo)
                        }
                      >
                        취소
                      </button>
                    </>

                  ) : (

                    <span className="text-disabled">
                      변경 불가
                    </span>

                  )}

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}
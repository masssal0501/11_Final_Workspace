import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function UserAmountList({ workcationNo }) {

  const navigate = useNavigate();

  const [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(false);


  // =========================================================
  // 비용 신청 목록 조회
  //
  // amount.workcation_no
  //        ↓
  // AmountController
  //        ↓
  // AmountService
  //        ↓
  // AmountDao
  //        ↓
  // selectAmountListByWorkcationNo
  // =========================================================

  const fetchAmountList = useCallback(async () => {

    // 워케이션 번호가 없으면 조회하지 않음
    if (
      workcationNo === null ||
      workcationNo === undefined ||
      workcationNo === ''
    ) {
      setAmounts([]);
      return;
    }

    try {

      setLoading(true);

      const data =
        await amountApi.getAmountListByWorkcation(
          Number(workcationNo)
        );

      console.log(
        '📌 내 비용 정산 신청 목록:',
        data
      );

      setAmounts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 목록 조회 실패:',
        error
      );

      setAmounts([]);

    } finally {

      setLoading(false);

    }

  }, [workcationNo]);


  // =========================================================
  // 워케이션 번호 변경 시 목록 다시 조회
  // =========================================================

  useEffect(() => {

    fetchAmountList();

  }, [fetchAmountList]);


  // =========================================================
  // 날짜 포맷
  //
  // DB requested_at
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

  const formatMoney = (amount) => {

    if (
      amount === null ||
      amount === undefined ||
      amount === ''
    ) {
      return '-';
    }

    const number = Number(amount);

    if (Number.isNaN(number)) {
      return '-';
    }

    return `${number.toLocaleString('ko-KR')} 원`;
  };


  // =========================================================
  // 상태 이름
  //
  // R : 검토
  // A : 승인
  // H : 보류
  // J : 반려
  // C : 취소
  // =========================================================

  const statusMap = {
    R: '검토중',
    A: '승인됨',
    H: '보류됨',
    J: '반려됨',
    C: '취소됨'
  };


  // =========================================================
  // 상태 뱃지
  // =========================================================

  const getStatusBadge = (status) => {

    return (
      <span
        className={`status-badge status-${status || 'UNKNOWN'}`}
      >
        {statusMap[status] || '알 수 없음'}
      </span>
    );
  };


  // =========================================================
  // 비용 신청 상세 / 수정
  //
  // 수정 가능
  // R 검토
  // H 보류
  //
  // 수정 불가
  // A 승인
  // J 반려
  // C 취소
  // =========================================================

  const handleEdit = (item) => {

    if (!item?.amountNo) {

      alert('비용 신청 번호가 없습니다.');
      return;

    }

    if (!['R', 'H'].includes(item.status)) {

      alert(
        '검토중 또는 보류 상태의 비용 신청만 수정할 수 있습니다.'
      );

      return;
    }

    navigate(
      `/cost/apply/${item.amountNo}`
    );
  };


  // =========================================================
  // 비용 신청 취소
  //
  // R / H만 취소 가능
  //
  // A 승인 → 취소 불가
  // J 반려 → 취소 불가
  // C 취소 → 취소 불가
  // =========================================================

  const handleCancel = async (item) => {

    if (!item?.amountNo) {

      alert(
        '비용 신청 번호가 없습니다.'
      );

      return;
    }


    if (!['R', 'H'].includes(item.status)) {

      alert(
        '검토중 또는 보류 상태의 신청만 취소할 수 있습니다.'
      );

      return;
    }


    const confirmed =
      window.confirm(
        `[신청번호 ${item.amountNo}] 비용 정산 신청을 취소하시겠습니까?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await amountApi.cancelAmount(
        item.amountNo
      );

      alert(
        '비용 정산 신청이 취소되었습니다.'
      );

      await fetchAmountList();

    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 취소 실패:',
        error
      );

      const message =
        error?.response?.data;

      if (
        typeof message === 'string' &&
        message.trim() !== ''
      ) {

        alert(message);

      } else {

        alert(
          '비용 정산 신청 취소에 실패했습니다.'
        );

      }

    }
  };


  // =========================================================
  // 비용 신청하기
  // =========================================================

  const handleApply = () => {

    if (
      workcationNo === null ||
      workcationNo === undefined ||
      workcationNo === ''
    ) {

      alert(
        '워케이션 정보가 없습니다.'
      );

      return;
    }

    navigate(
      `/cost/apply?workcationNo=${workcationNo}`
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
          내 비용 정산 신청 내역
        </h2>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleApply}
        >
          + 비용 신청하기
        </button>

      </div>


      {/* =====================================================
          로딩
          ===================================================== */}

      {loading ? (

        <div className="amount-loading">
          비용 정산 신청 내역을 불러오는 중입니다...
        </div>

      ) : (

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

            {/* =================================================
                데이터 없음
                ================================================= */}

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

                <tr
                  key={item.amountNo}
                >

                  {/* 신청번호 */}

                  <td className="text-center">
                    {item.amountNo}
                  </td>


                  {/* 신청 금액 */}

                  <td className="text-right">
                    {formatMoney(
                      item.requestedAmount
                    )}
                  </td>


                  {/* 승인 금액 */}

                  <td className="text-right">
                    {formatMoney(
                      item.approvedAmount
                    )}
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


                  {/* 신청 관리 */}

                  <td className="text-center">

                    {['R', 'H'].includes(
                      item.status
                    ) ? (

                      <>

                        <button
                          type="button"
                          className="btn btn-edit"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          className="btn btn-cancel"
                          onClick={() =>
                            handleCancel(item)
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

      )}

    </div>

  );
}
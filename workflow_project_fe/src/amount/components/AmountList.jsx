import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';

export default function AmountList({ workcationNo }) {

  const navigate = useNavigate();

  const [amounts, setAmounts] = useState([]);
  const [loading, setLoading] = useState(true);


  // =========================================================
  // 해당 워케이션의 정산 신청 목록 조회
  //
  // 사용자 화면
  //
  // workcationNo
  //      ↓
  // amount
  //      ↓
  // 해당 워케이션의 정산 신청 목록
  // =========================================================
  const fetchAmountList = async () => {

    if (!workcationNo) {

      console.log(
        '⚠️ workcationNo가 없습니다.'
      );

      setAmounts([]);
      setLoading(false);

      return;
    }


    try {

      setLoading(true);


      const data =
        await amountApi.getAmountListByWorkcation(
          workcationNo
        );


      console.log(
        '📋 비용 정산 신청 목록 응답:',
        data
      );


      // =====================================================
      // 서버 응답 형태
      //
      // {
      //   pageLimit: 5,
      //   startPage: 1,
      //   boardLimit: 10,
      //   limit: 10,
      //   page: 1,
      //   endPage: 1,
      //   listCount: 5,
      //   maxPage: 1,
      //   list: [...]
      // }
      //
      // 혹시 API가 배열을 바로 반환하는 경우도 대응
      // =====================================================

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.list)
            ? data.list
            : [];


      console.log(
        '📋 현재 워케이션 정산 신청 목록:',
        list
      );


      setAmounts(list);


    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 목록 조회 실패:',
        error
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );

      setAmounts([]);


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // workcationNo가 변경되면 다시 조회
  // =========================================================
  useEffect(() => {

    fetchAmountList();

  }, [workcationNo]);


  // =========================================================
  // 상태명
  // =========================================================
  const getStatusText = (status) => {

    const statusMap = {

      R: '검토중',
      A: '승인됨',
      J: '반려됨',
      H: '보류됨',
      C: '취소됨'

    };

    return (
      statusMap[status] ||
      status ||
      '-'
    );

  };


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


    const number =
      Number(value);


    if (Number.isNaN(number)) {
      return '-';
    }


    return `${number.toLocaleString('ko-KR')} 원`;

  };


  // =========================================================
  // 상세 페이지 이동
  // =========================================================
  const handleDetail = (amountNo) => {

    navigate(
      `/cost/detail/${amountNo}`
    );

  };


  // =========================================================
  // 로딩
  // =========================================================
  if (loading) {

    return (

      <div className="amount-container">

        <div
          style={{
            padding: '40px',
            textAlign: 'center'
          }}
        >
          비용 정산 신청 내역을 불러오는 중입니다...
        </div>

      </div>

    );

  }


  // =========================================================
  // 화면
  // =========================================================
  return (

    <div className="amount-container">

      {/* =====================================================
          제목
      ====================================================== */}
      <h2 className="amount-title">

        워케이션 비용 정산 신청 내역

      </h2>


      {/* =====================================================
          워케이션 번호
      ====================================================== */}
      <div
        style={{
          marginBottom: '15px',
          fontSize: '14px',
          color: '#666'
        }}
      >

        워케이션 번호 :

        <strong>
          {workcationNo || '-'}
        </strong>

      </div>


      {/* =====================================================
          정산 신청 목록
      ====================================================== */}
      <table className="amount-table">

        <thead>

          <tr>

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
              상세
            </th>

          </tr>

        </thead>


        <tbody>

          {/* =================================================
              신청 내역 없음
          ================================================== */}
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

                onClick={() =>
                  handleDetail(
                    item.amountNo
                  )
                }

                style={{
                  cursor: 'pointer'
                }}
              >

                {/* =================================================
                    신청번호
                ================================================== */}
                <td className="text-center">

                  {item.amountNo}

                </td>


                {/* =================================================
                    신청 금액
                ================================================== */}
                <td className="text-right">

                  {formatMoney(
                    item.requestedAmount
                  )}

                </td>


                {/* =================================================
                    승인 금액
                ================================================== */}
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


                {/* =================================================
                    상태
                ================================================== */}
                <td className="text-center">

                  <span
                    className={
                      `status-badge status-${item.status}`
                    }
                  >

                    {getStatusText(
                      item.status
                    )}

                  </span>

                </td>


                {/* =================================================
                    신청일
                ================================================== */}
                <td className="text-center">

                  {formatDate(
                    item.requestedAt
                  )}

                </td>


                {/* =================================================
                    상세
                ================================================== */}
                <td className="text-center">

                  <button
                    type="button"
                    className="btn btn-secondary"

                    onClick={(e) => {

                      e.stopPropagation();

                      handleDetail(
                        item.amountNo
                      );

                    }}
                  >

                    상세보기

                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>

  );

}
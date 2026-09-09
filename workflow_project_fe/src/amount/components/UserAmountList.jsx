import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { amountApi } from '../api/amountApi';

import '../styles/AmountStyle.css';


// =========================================================
// 사용자 비용 정산 신청 목록
// =========================================================
//
// Amount 구조
//
// amount
//   └── amountNo
//   └── requestedAt
//   └── status
//   └── itemList
//          ├── amount                  → 신청 금액
//          └── itemApprovedAmount      → 회사 지원금
//
// =========================================================


export default function UserAmountList({
  workcationNo
}) {

  const navigate = useNavigate();


  // =========================================================
  // 상태
  // =========================================================

  const [amounts, setAmounts] = useState([]);

  const [loading, setLoading] = useState(false);


  // =========================================================
  // 비용 정산 신청 목록 조회
  // =========================================================

  const fetchAmountList = useCallback(async () => {

    // -------------------------------------------------------
    // workcationNo 확인
    // -------------------------------------------------------

    if (
      workcationNo === null ||
      workcationNo === undefined ||
      workcationNo === ''
    ) {

      console.log(
        '⚠️ workcationNo가 없습니다.'
      );

      setAmounts([]);

      return;
    }


    try {

      setLoading(true);


      // -----------------------------------------------------
      // 숫자 변환
      // -----------------------------------------------------

      const no = Number(workcationNo);


      if (
        !Number.isFinite(no) ||
        no <= 0
      ) {

        console.error(
          '❌ 잘못된 workcationNo:',
          workcationNo
        );

        setAmounts([]);

        return;
      }


      console.log(
        '================================='
      );

      console.log(
        '📌 사용자 비용 목록 조회'
      );

      console.log(
        '📌 workcationNo:',
        no
      );

      console.log(
        '================================='
      );


      // -----------------------------------------------------
      // API 호출
      // -----------------------------------------------------

      const data =
        await amountApi.getAmountListByWorkcation(no);


      console.log(
        '📌 비용 정산 목록 응답:',
        data
      );


      // -----------------------------------------------------
      // 응답 구조 대응
      // -----------------------------------------------------

      let list = [];


      if (Array.isArray(data)) {

        list = data;

      } else if (
        Array.isArray(data?.list)
      ) {

        list = data.list;

      }


      console.log(
        '📋 최종 비용 목록:',
        list
      );


      setAmounts(list);


    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 목록 조회 실패:',
        error
      );

      console.error(
        '상태 코드:',
        error.response?.status
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );


      setAmounts([]);


    } finally {

      setLoading(false);

    }

  }, [workcationNo]);


  // =========================================================
  // workcationNo 변경 시 목록 재조회
  // =========================================================

  useEffect(() => {

    fetchAmountList();

  }, [fetchAmountList]);


  // =========================================================
  // 상태
  // =========================================================

  const statusMap = {

    R: '검토중',
    A: '승인됨',
    H: '보류됨',
    J: '반려됨',
    C: '취소됨'

  };


  // =========================================================
  // 상태명
  // =========================================================

  const getStatusText = (status) => {

    if (!status) {

      return '알 수 없음';

    }


    return (
      statusMap[status] ||
      status
    );

  };


  // =========================================================
  // 상태 뱃지
  // =========================================================

  const getStatusBadge = (status) => {

    return (

      <span
        className={
          `amount-status-badge status-${status || 'UNKNOWN'}`
        }
      >

        {getStatusText(status)}

      </span>

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


    if (
      Number.isNaN(
        d.getTime()
      )
    ) {

      return '-';

    }


    const year =
      d.getFullYear();

    const month =
      String(
        d.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        d.getDate()
      ).padStart(2, '0');


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


    const number =
      Number(amount);


    if (
      Number.isNaN(number)
    ) {

      return '-';

    }


    return (
      `${number.toLocaleString('ko-KR')} 원`
    );

  };


  // =========================================================
  // 신청 금액 합계
  // =========================================================
  //
  // amount_item.amount
  //     ↓
  // 신청 금액
  //
  // =========================================================

  const getRequestedAmount = (item) => {

    // -------------------------------------------------------
    // itemList가 있는 경우
    // -------------------------------------------------------

    if (
      Array.isArray(item?.itemList)
    ) {

      return item.itemList.reduce(
        (total, detailItem) => {

          return (
            total +
            (Number(detailItem?.amount) || 0)
          );

        },
        0
      );

    }


    // -------------------------------------------------------
    // 기존 API 호환
    // -------------------------------------------------------

    if (
      item?.requestedAmount !== null &&
      item?.requestedAmount !== undefined
    ) {

      return Number(
        item.requestedAmount
      ) || 0;

    }


    return 0;

  };


  // =========================================================
  // 회사 지원금 합계
  // =========================================================
  //
  // amount_item.item_approved_amount
  //     ↓
  // 회사 지원금
  //
  // =========================================================

  const getCompanySupportAmount = (item) => {

    // -------------------------------------------------------
    // itemList가 있는 경우
    // -------------------------------------------------------

    if (
      Array.isArray(item?.itemList)
    ) {

      return item.itemList.reduce(
        (total, detailItem) => {

          // -------------------------------------------------
          // MyBatis
          // itemApprovedAmount
          // -------------------------------------------------

          const support =
            detailItem?.itemApprovedAmount;


          return (
            total +
            (Number(support) || 0)
          );

        },
        0
      );

    }


    // -------------------------------------------------------
    // 기존 API 호환
    // -------------------------------------------------------

    if (
      item?.approvedAmount !== null &&
      item?.approvedAmount !== undefined
    ) {

      return Number(
        item.approvedAmount
      ) || 0;

    }


    return 0;

  };


  // =========================================================
  // 비용 신청 상세 조회
  // =========================================================

  const handleDetail = (amountNo) => {

    if (
      amountNo === null ||
      amountNo === undefined ||
      amountNo === ''
    ) {

      alert(
        '비용 신청 번호가 없습니다.'
      );

      return;

    }


    navigate(
      `/cost/detail/${amountNo}`
    );

  };


  // =========================================================
  // 비용 신청 수정
  // =========================================================
  //
  // R : 수정 가능
  // H : 수정 가능
  //
  // A : 수정 불가
  // J : 수정 불가
  // C : 수정 불가
  //
  // =========================================================

  const handleEdit = (item) => {

    if (!item?.amountNo) {

      alert(
        '비용 신청 번호가 없습니다.'
      );

      return;

    }


    if (
      !['R', 'H'].includes(
        item.status
      )
    ) {

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
  // =========================================================
  //
  // R / H 상태만 취소 가능
  //
  // =========================================================

  const handleCancel = async (item) => {

    if (!item?.amountNo) {

      alert(
        '비용 신청 번호가 없습니다.'
      );

      return;

    }


    // -------------------------------------------------------
    // 상태 확인
    // -------------------------------------------------------

    if (
      !['R', 'H'].includes(
        item.status
      )
    ) {

      alert(
        '검토중 또는 보류 상태의 신청만 취소할 수 있습니다.'
      );

      return;

    }


    // -------------------------------------------------------
    // 확인
    // -------------------------------------------------------

    const confirmed =
      window.confirm(

        `[신청번호 ${item.amountNo}] ` +
        `비용 정산 신청을 취소하시겠습니까?`

      );


    if (!confirmed) {

      return;

    }


    try {

      console.log(
        '================================='
      );

      console.log(
        '📌 비용 신청 취소'
      );

      console.log(
        'amountNo:',
        item.amountNo
      );

      console.log(
        'status:',
        item.status
      );

      console.log(
        '================================='
      );


      // -----------------------------------------------------
      // 서버 취소 요청
      // -----------------------------------------------------

      await amountApi.cancelAmount(
        item.amountNo
      );


      alert(
        '비용 정산 신청이 취소되었습니다.'
      );


      // -----------------------------------------------------
      // 목록 재조회
      // -----------------------------------------------------

      await fetchAmountList();


    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 취소 실패:',
        error
      );

      console.error(
        '상태 코드:',
        error.response?.status
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );


      const responseData =
        error?.response?.data;


      if (
        typeof responseData === 'string' &&
        responseData.trim() !== ''
      ) {

        alert(
          responseData
        );

      } else if (
        responseData?.message
      ) {

        alert(
          responseData.message
        );

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
  // 로딩
  // =========================================================

  if (loading) {

    return (

      <div className="amount-container">

        <div className="amount-loading">

          비용 정산 신청 내역을
          불러오는 중입니다...

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
          헤더
      ====================================================== */}

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

        <strong
          style={{
            marginLeft: '5px'
          }}
        >

          {workcationNo || '-'}

        </strong>

      </div>


      {/* =====================================================
          비용 신청 목록
      ====================================================== */}

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
              회사 지원금
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

            amounts.map((item) => {

              // ------------------------------------------------
              // 신청 금액
              // ------------------------------------------------

              const requestedAmount =
                getRequestedAmount(item);


              // ------------------------------------------------
              // 회사 지원금
              // ------------------------------------------------

              const companySupportAmount =
                getCompanySupportAmount(item);


              return (

                <tr
                  key={item.amountNo}
                >


                  {/* =========================================
                      신청번호
                  ========================================== */}

                  <td className="text-center">

                    {item.amountNo}

                  </td>


                  {/* =========================================
                      신청 금액
                  ========================================== */}

                  <td className="text-right">

                    {formatMoney(
                      requestedAmount
                    )}

                  </td>


                  {/* =========================================
                      회사 지원금
                  ========================================== */}

                  <td className="text-right">

                    {formatMoney(
                      companySupportAmount
                    )}

                  </td>


                  {/* =========================================
                      상태
                  ========================================== */}

                  <td className="text-center">

                    {getStatusBadge(
                      item.status
                    )}

                  </td>


                  {/* =========================================
                      신청일
                  ========================================== */}

                  <td className="text-center">

                    {formatDate(
                      item.requestedAt
                    )}

                  </td>


                  {/* =========================================
                      신청 관리
                  ========================================== */}

                  <td className="text-center">


                    {/* ---------------------------------------
                        R / H
                        수정 + 취소
                    ---------------------------------------- */}

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

              );

            })

          )}

        </tbody>

      </table>


      {/* =====================================================
          안내
      ====================================================== */}

      <div
        style={{
          marginTop: '12px',
          fontSize: '13px',
          color: '#777'
        }}
      >

        ※ 검토중 또는 보류 상태의 신청만
        수정 및 취소할 수 있습니다.

      </div>


    </div>

  );

}
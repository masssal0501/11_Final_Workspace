import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountDetail() {

  const { amountNo } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // 결재 의견
  // =========================================================

  const [comment, setComment] = useState('');

  // =========================================================
  // 회사 지원금
  //
  // 기본 1개 행
  // [+ 추가] 버튼으로 행 추가
  // 각 행에서 비용 항목 선택 + 회사 지원금 입력
  // =========================================================

  const [companySupportRows, setCompanySupportRows] = useState([]);

  // =========================================================
  // 지자체 지원금
  //
  // 회사 지원금과 완전히 별도 관리
  // =========================================================

  const [localSupportRows, setLocalSupportRows] = useState([]);

  const [sponsorName, setSponsorName] = useState('');
  const [localSupportAmount, setLocalSupportAmount] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState('UNPAID');
  const [remark, setRemark] = useState('');


  // =========================================================
  // 상세 조회
  // =========================================================

  useEffect(() => {

    if (!amountNo) {

      console.error('❌ amountNo가 없습니다.');
      setLoading(false);

      return;
    }


    const fetchDetail = async () => {

      try {

        setLoading(true);

        console.log('=================================');
        console.log('📌 비용 상세 조회');
        console.log('📌 amountNo:', amountNo);
        console.log('=================================');


        const data =
          await amountApi.getAmountById(amountNo);


        console.log('📌 상세 데이터:', data);


        setDetail(data);


        // =====================================================
        // 결재 의견
        // =====================================================

        setComment(
          data?.amountComment || ''
        );


        // =====================================================
        // 비용 항목
        // =====================================================

        const items =
          Array.isArray(data?.itemList)
            ? data.itemList
            : [];


        // =====================================================
        // 회사 지원금
        //
        // 기존 amount_item.amount 사용 제거
        //
        // DB의 amount_item에는 회사 지원금 금액이 없으므로
        // 화면 상태로 관리
        //
        // 기본적으로 첫 번째 비용 항목 1개를 생성
        // =====================================================

        if (items.length > 0) {

          setCompanySupportRows([
            {
              rowId: Date.now(),
              itemNo: String(items[0].itemNo),
              amount: ''
            }
          ]);

        } else {

          setCompanySupportRows([]);

        }


        // =====================================================
        // 지자체 지원금
        //
        // amount_list는 amount 단위 지원기관 목록
        // itemNo 기준으로 묶지 않음
        // =====================================================

        const sponsors =
          Array.isArray(data?.sponsorList)
            ? data.sponsorList
            : [];


        const sponsorRows =
          sponsors.map((sponsor, index) => ({

            rowId:
              sponsor?.amountListNo ||
              `existing-${index}`,

            amountListNo:
              sponsor?.amountListNo,

            sponsorName:
              sponsor?.sponsorName || '',

            amount:
              Number(sponsor?.amount) || 0,

            status:
              sponsor?.status || 'UNPAID',

            paymentDate:
              sponsor?.paymentDate,

            remark:
              sponsor?.remark || ''

          }));


        setLocalSupportRows(sponsorRows);


      } catch (error) {

        console.error(
          '❌ 비용 상세 조회 실패:',
          error
        );

        console.error(
          '상태 코드:',
          error?.response?.status
        );

        console.error(
          '서버 응답:',
          error?.response?.data
        );


        alert(
          error?.response?.data?.message ||
          error?.response?.data ||
          '데이터를 불러오는 데 실패했습니다.'
        );

      } finally {

        setLoading(false);

      }

    };


    fetchDetail();

  }, [amountNo]);


  // =========================================================
  // 로딩
  // =========================================================

  if (loading) {

    return (

      <div className="amount-container">

        비용 상세 정보를 불러오는 중입니다...

      </div>

    );

  }


  // =========================================================
  // 데이터 없음
  // =========================================================

  if (!detail) {

    return (

      <div className="amount-container">

        <div className="detail-box">

          <p>
            조회된 비용 신청 정보가 없습니다.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            목록으로
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // 상태명
  // =========================================================

  const getStatusText = (status) => {

    const statusMap = {

      R: '검토중',
      A: '승인',
      H: '보류',
      J: '반려',
      C: '취소'

    };

    return (
      statusMap[status] ||
      status ||
      '알 수 없음'
    );

  };


  // =========================================================
  // 항목 유형
  // =========================================================

  const getItemTypeText = (itemType) => {

    const typeMap = {

      S: '숙박',
      T: '교통',
      E: '체험',
      F: '식비',
      V: '차량',
      O: '기타'

    };

    return (
      typeMap[itemType] ||
      itemType ||
      '기타'
    );

  };


  // =========================================================
  // 항목 승인 상태
  // =========================================================

  const getItemApprovedText = (status) => {

    const statusMap = {

      A: '승인',
      C: '취소',
      H: '보류',
      J: '반려',
      R: '검토'

    };

    return (
      statusMap[status] ||
      status ||
      '-'
    );

  };


  // =========================================================
  // 지자체 지원금 상태
  // =========================================================

  const getSponsorStatusText = (status) => {

    const statusMap = {

      PAID: '지급완료',
      UNPAID: '미지급',
      HOLD: '보류'

    };

    return (
      statusMap[status] ||
      status ||
      '-'
    );

  };


  // =========================================================
  // 날짜
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
  // 금액
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
  // 수정 가능 여부
  // =========================================================

  const canEditable =
    detail.status === 'R' ||
    detail.status === 'H';


  // =========================================================
  // 항목 목록
  // =========================================================

  const itemList =
    Array.isArray(detail.itemList)
      ? detail.itemList
      : [];


  // =========================================================
  // 회사 지원금 합계
  // =========================================================

  const totalCompanySupport =
    companySupportRows.reduce(
      (sum, row) =>
        sum +
        (Number(row.amount) || 0),
      0
    );


  // =========================================================
  // 지자체 지원금 합계
  // =========================================================

  const totalLocalSupport =
    localSupportRows.reduce(
      (sum, row) =>
        sum +
        (Number(row.amount) || 0),
      0
    );


  // =========================================================
  // 신청 금액
  // =========================================================

  const requestedAmount =
    Number(detail.requestedAmount) || 0;


  // =========================================================
  // 최종 지원금
  // =========================================================

  const grandTotal =
    totalCompanySupport +
    totalLocalSupport;


  // =========================================================
  // 신청 금액 초과
  // =========================================================

  const isOverRequested =
    grandTotal > requestedAmount;


  // =========================================================
  // 회사 지원금 행 추가
  // =========================================================

  const handleAddCompanyRow = () => {

    const usedItemNos =
      companySupportRows.map(
        row => String(row.itemNo)
      );


    const nextItem =
      itemList.find(
        item =>
          !usedItemNos.includes(
            String(item.itemNo)
          )
      );


    if (!nextItem) {

      alert(
        '추가할 수 있는 비용 항목이 없습니다.'
      );

      return;

    }


    setCompanySupportRows(prev => [

      ...prev,

      {
        rowId: Date.now(),
        itemNo: String(nextItem.itemNo),
        amount: ''
      }

    ]);

  };


  // =========================================================
  // 회사 지원금 항목 변경
  // =========================================================

  const handleCompanyItemChange = (
    rowId,
    itemNo
  ) => {

    setCompanySupportRows(prev =>

      prev.map(row =>

        row.rowId === rowId

          ? {
              ...row,
              itemNo,
              amount: ''
            }

          : row

      )

    );

  };


  // =========================================================
  // 회사 지원금 금액 변경
  // =========================================================

  const handleCompanyAmountChange = (
    rowId,
    amount
  ) => {

    setCompanySupportRows(prev =>

      prev.map(row =>

        row.rowId === rowId

          ? {
              ...row,
              amount
            }

          : row

      )

    );

  };


  // =========================================================
  // 회사 지원금 행 삭제
  // =========================================================

  const handleRemoveCompanyRow = (rowId) => {

    setCompanySupportRows(prev => {

      // 기본 행 1개는 유지
      if (prev.length <= 1) {

        alert(
          '회사 지원금 항목은 최소 1개가 필요합니다.'
        );

        return prev;

      }


      return prev.filter(
        row => row.rowId !== rowId
      );

    });

  };


  // =========================================================
  // 회사 지원금 적용
  //
  // 현재 화면 상태에 반영
  // =========================================================

  const handleCompanySupportApply = (
    rowId
  ) => {

    const row =
      companySupportRows.find(
        item => item.rowId === rowId
      );


    if (!row) {
      return;
    }


    const amount =
      Number(row.amount);


    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {

      alert(
        '올바른 회사 지원금을 입력해주세요.'
      );

      return;

    }


    alert(
      '회사 지원금이 적용되었습니다.'
    );

  };


  // =========================================================
  // 지자체 지원금 입력
  // =========================================================

  const handleLocalSupportApply = () => {

    const amount =
      Number(localSupportAmount);


    if (
      Number.isNaN(amount) ||
      amount < 0
    ) {

      alert(
        '올바른 지자체 지원금 금액을 입력해주세요.'
      );

      return;

    }


    if (
      amount > 0 &&
      !sponsorName.trim()
    ) {

      alert(
        '지자체 지원금이 있는 경우 지원기관명을 입력해주세요.'
      );

      return;

    }


    const newRow = {

      rowId:
        `TEMP-${Date.now()}`,

      amountListNo:
        null,

      sponsorName:
        sponsorName.trim(),

      amount,

      status:
        sponsorStatus,

      paymentDate:
        null,

      remark:
        remark.trim()

    };


    setLocalSupportRows(prev => [

      ...prev,

      newRow

    ]);


    // 입력값 초기화
    setSponsorName('');
    setLocalSupportAmount('');
    setSponsorStatus('UNPAID');
    setRemark('');


    alert(
      '지자체 지원금이 추가되었습니다.'
    );

  };


  // =========================================================
  // 지자체 지원금 삭제
  // =========================================================

  const handleRemoveLocalRow = (rowId) => {

    setLocalSupportRows(prev =>
      prev.filter(
        row => row.rowId !== rowId
      )
    );

  };


  // =========================================================
  // 승인 처리
  // =========================================================

  const handleApprovalSubmit = async (e) => {

    e.preventDefault();


    if (!canEditable) {

      alert(
        '검토중 또는 보류 상태의 신청만 승인할 수 있습니다.'
      );

      return;

    }


    const parsedCompanyAmount =
      Number(totalCompanySupport);


    const parsedLocalAmount =
      Number(totalLocalSupport);


    // =======================================================
    // 검증
    // =======================================================

    if (
      Number.isNaN(parsedCompanyAmount) ||
      parsedCompanyAmount < 0
    ) {

      alert(
        '올바른 회사 지원금을 입력해주세요.'
      );

      return;

    }


    if (
      Number.isNaN(parsedLocalAmount) ||
      parsedLocalAmount < 0
    ) {

      alert(
        '올바른 지자체 지원금을 입력해주세요.'
      );

      return;

    }


    const calculatedTotal =
      parsedCompanyAmount +
      parsedLocalAmount;


    if (
      calculatedTotal >
      requestedAmount
    ) {

      alert(
        `회사 지원금과 지자체 지원금의 합계가 ` +
        `신청 금액을 초과할 수 없습니다.\n\n` +

        `신청 금액: ${
          formatMoney(requestedAmount)
        }\n` +

        `회사 지원금: ${
          formatMoney(parsedCompanyAmount)
        }\n` +

        `지자체 지원금: ${
          formatMoney(parsedLocalAmount)
        }\n` +

        `최종 지원금: ${
          formatMoney(calculatedTotal)
        }`
      );

      return;

    }


    // =======================================================
    // 확인
    // =======================================================

    const confirmed =
      window.confirm(

        `비용 신청을 승인하시겠습니까?\n\n` +

        `신청번호: ${detail.amountNo}\n` +

        `신청자: ${
          detail.empName || '정보 없음'
        }\n` +

        `신청 금액: ${
          formatMoney(requestedAmount)
        }\n\n` +

        `회사 지원금: ${
          formatMoney(parsedCompanyAmount)
        }\n` +

        `지자체 지원금: ${
          formatMoney(parsedLocalAmount)
        }\n` +

        `최종 지원금: ${
          formatMoney(calculatedTotal)
        }`

      );


    if (!confirmed) {
      return;
    }


    // =======================================================
    // 서버 요청
    // =======================================================

    try {

      console.log('=================================');
      console.log('===== 비용 승인 처리 =====');

      console.log(
        'amountNo:',
        detail.amountNo
      );

      console.log(
        'status:',
        'A'
      );

      console.log(
        'companySupportRows:',
        companySupportRows
      );

      console.log(
        'localSupportRows:',
        localSupportRows
      );

      console.log(
        'companySupportTotal:',
        parsedCompanyAmount
      );

      console.log(
        'localSupportTotal:',
        parsedLocalAmount
      );

      console.log(
        'finalSupport:',
        calculatedTotal
      );

      console.log('=================================');


      await amountApi.updateApproval(

        detail.amountNo,

        'A',

        parsedCompanyAmount,

        comment,

        '',

        parsedLocalAmount,

        'UNPAID',

        ''

      );


      alert(
        '승인 처리가 완료되었습니다.'
      );


      navigate('/admin/cost/list');


    } catch (error) {

      console.error(
        '❌ 승인 처리 실패:',
        error
      );

      console.error(
        '상태 코드:',
        error?.response?.status
      );

      console.error(
        '서버 응답:',
        error?.response?.data
      );


      alert(
        error?.response?.data?.message ||
        error?.response?.data ||
        '승인 처리에 실패했습니다.'
      );

    }

  };


  // =========================================================
  // 화면
  // =========================================================

  return (

    <div className="amount-container">


      {/* =====================================================
          제목
      ====================================================== */}

      <h2 className="amount-title admin">

        비용 정산 상세 내역

        <span
          style={{
            marginLeft: '8px',
            fontSize: '16px'
          }}
        >
          #{detail.amountNo}
        </span>

      </h2>


      <form
        className="detail-box"
        onSubmit={handleApprovalSubmit}
      >


        {/* ===================================================
            기본 정보
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청자
          </span>

          <span className="info-value">
            {detail.empName || '정보 없음'}
          </span>

        </div>


        <div className="info-row">

          <span className="info-label">
            신청번호
          </span>

          <span className="info-value">
            {detail.amountNo}
          </span>

        </div>


        <div className="info-row">

          <span className="info-label">
            워케이션 번호
          </span>

          <span className="info-value">
            {detail.workcationNo ?? '-'}
          </span>

        </div>


        <div className="info-row">

          <span className="info-label">
            상태
          </span>

          <span className="info-value">

            <span
              className={
                `status-badge status-${
                  detail.status || 'UNKNOWN'
                }`
              }
            >
              {getStatusText(detail.status)}
            </span>

          </span>

        </div>


        <div className="info-row">

          <span className="info-label">
            신청일
          </span>

          <span className="info-value">
            {formatDate(detail.requestedAt)}
          </span>

        </div>


        <div className="info-row">

          <span className="info-label">
            신청 금액
          </span>

          <span className="info-value">
            {formatMoney(requestedAmount)}
          </span>

        </div>


        {/* ===================================================
            회사 지원금
        ==================================================== */}

        <div
          className="info-row comment-row"
          style={{
            display: 'block'
          }}
        >

          <span
            className="info-label"
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            회사 지원금
          </span>


          <div
            style={{
              width: '100%',
              overflowX: 'auto'
            }}
          >

            <table
              className="amount-table"
              style={{
                minWidth: '850px'
              }}
            >

              <thead>

                <tr>

                  <th>
                    비용 항목
                  </th>

                  <th>
                    설명
                  </th>

                  <th>
                    사용일
                  </th>

                  <th>
                    회사 지원금
                  </th>

                  {canEditable && (
                    <th>
                      관리
                    </th>
                  )}

                </tr>

              </thead>


              <tbody>

                {companySupportRows.map((row) => {

                  const item =
                    itemList.find(
                      item =>
                        String(item.itemNo) ===
                        String(row.itemNo)
                    );


                  return (

                    <tr
                      key={row.rowId}
                    >

                      {/* 비용 항목 */}

                      <td>

                        {canEditable ? (

                          <select
                            value={row.itemNo}
                            onChange={(e) =>
                              handleCompanyItemChange(
                                row.rowId,
                                e.target.value
                              )
                            }
                            className="sponsor-select"
                          >

                            {itemList.map((itemOption) => {

                              const alreadyUsed =
                                companySupportRows.some(
                                  otherRow =>
                                    otherRow.rowId !== row.rowId &&
                                    String(otherRow.itemNo) ===
                                    String(itemOption.itemNo)
                                );


                              return (

                                <option
                                  key={
                                    itemOption.itemNo
                                  }
                                  value={
                                    itemOption.itemNo
                                  }
                                  disabled={
                                    alreadyUsed
                                  }
                                >

                                  {
                                    getItemTypeText(
                                      itemOption.itemType
                                    )
                                  }

                                  {' - '}

                                  {
                                    itemOption.itemDescription ||
                                    '설명 없음'
                                  }

                                </option>

                              );

                            })}

                          </select>

                        ) : (

                          <span className="item-badge">

                            {
                              getItemTypeText(
                                item?.itemType
                              )
                            }

                          </span>

                        )}

                      </td>


                      {/* 설명 */}

                      <td>

                        {
                          item?.itemDescription ||
                          '설명 없음'
                        }

                      </td>


                      {/* 사용일 */}

                      <td>

                        {
                          formatDate(
                            item?.itemDate
                          )
                        }

                      </td>


                      {/* 회사 지원금 */}

                      <td>

                        {canEditable ? (

                          <input
                            type="number"
                            min="0"
                            value={
                              row.amount
                            }
                            onChange={(e) =>
                              handleCompanyAmountChange(
                                row.rowId,
                                e.target.value
                              )
                            }
                            placeholder="금액 입력"
                            className="sponsor-input"
                          />

                        ) : (

                          formatMoney(
                            row.amount
                          )

                        )}

                      </td>


                      {/* 관리 */}

                      {canEditable && (

                        <td>

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                              handleCompanySupportApply(
                                row.rowId
                              )
                            }
                          >
                            적용
                          </button>


                          {companySupportRows.length > 1 && (

                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{
                                marginLeft: '5px'
                              }}
                              onClick={() =>
                                handleRemoveCompanyRow(
                                  row.rowId
                                )
                              }
                            >
                              삭제
                            </button>

                          )}

                        </td>

                      )}

                    </tr>

                  );

                })}


                {companySupportRows.length === 0 && (

                  <tr>

                    <td
                      colSpan={
                        canEditable ? 5 : 4
                      }
                      style={{
                        textAlign: 'center'
                      }}
                    >
                      비용 항목이 없습니다.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              회사 지원금 추가
          ================================================== */}

          {canEditable && (

            <div
              style={{
                marginTop: '15px',
                textAlign: 'right'
              }}
            >

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddCompanyRow}
              >
                + 추가
              </button>

            </div>

          )}


          {/* =================================================
              회사 지원금 합계
          ================================================== */}

          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              background: '#f8f8f8',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >

            <span>
              회사 지원금 합계
            </span>

            <strong>
              {formatMoney(
                totalCompanySupport
              )}
            </strong>

          </div>

        </div>


        {/* ===================================================
            지자체 지원금
        ==================================================== */}

        <div
          className="info-row comment-row"
          style={{
            display: 'block',
            marginTop: '25px'
          }}
        >

          <span
            className="info-label"
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            지자체 지원금
          </span>


          {/* =================================================
              지자체 지원금 입력
          ================================================== */}

          {canEditable && (

            <div
              className="sponsor-form-box"
              style={{
                marginBottom: '20px'
              }}
            >

              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  지원기관:
                </label>

                <input
                  type="text"
                  value={sponsorName}
                  onChange={(e) =>
                    setSponsorName(
                      e.target.value
                    )
                  }
                  className="sponsor-input"
                  placeholder="예: 안성시"
                />

              </div>


              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  지자체 지원금:
                </label>

                <input
                  type="number"
                  min="0"
                  value={localSupportAmount}
                  onChange={(e) =>
                    setLocalSupportAmount(
                      e.target.value
                    )
                  }
                  className="sponsor-input"
                  placeholder="금액 입력"
                />

              </div>


              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  지급 상태:
                </label>

                <select
                  value={sponsorStatus}
                  onChange={(e) =>
                    setSponsorStatus(
                      e.target.value
                    )
                  }
                  className="sponsor-select"
                >

                  <option value="PAID">
                    지급완료
                  </option>

                  <option value="UNPAID">
                    미지급
                  </option>

                  <option value="HOLD">
                    보류
                  </option>

                </select>

              </div>


              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  특이사항:
                </label>

                <input
                  type="text"
                  value={remark}
                  onChange={(e) =>
                    setRemark(
                      e.target.value
                    )
                  }
                  placeholder="특이사항 입력"
                  className="sponsor-input-flex"
                />

              </div>


              <div
                style={{
                  marginTop: '10px',
                  textAlign: 'right'
                }}
              >

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={
                    handleLocalSupportApply
                  }
                >
                  + 지자체 지원금 추가
                </button>

              </div>

            </div>

          )}


          {/* =================================================
              지자체 지원금 목록
          ================================================== */}

          <div
            style={{
              width: '100%',
              overflowX: 'auto'
            }}
          >

            <table
              className="amount-table"
              style={{
                minWidth: '700px'
              }}
            >

              <thead>

                <tr>

                  <th>
                    지원기관
                  </th>

                  <th>
                    지자체 지원금
                  </th>

                  <th>
                    지급 상태
                  </th>

                  <th>
                    특이사항
                  </th>

                  {canEditable && (
                    <th>
                      관리
                    </th>
                  )}

                </tr>

              </thead>


              <tbody>

                {localSupportRows.length > 0 ? (

                  localSupportRows.map(
                    (row) => (

                      <tr
                        key={row.rowId}
                      >

                        <td>
                          {row.sponsorName || '-'}
                        </td>

                        <td>
                          {formatMoney(
                            row.amount
                          )}
                        </td>

                        <td>
                          {
                            getSponsorStatusText(
                              row.status
                            )
                          }
                        </td>

                        <td>
                          {row.remark || '-'}
                        </td>

                        {canEditable && (

                          <td>

                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() =>
                                handleRemoveLocalRow(
                                  row.rowId
                                )
                              }
                            >
                              삭제
                            </button>

                          </td>

                        )}

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={
                        canEditable ? 5 : 4
                      }
                      style={{
                        textAlign: 'center'
                      }}
                    >
                      등록된 지자체 지원금이 없습니다.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              지자체 지원금 합계
          ================================================== */}

          <div
            style={{
              marginTop: '15px',
              padding: '15px',
              background: '#f8f8f8',
              borderRadius: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >

            <span>
              지자체 지원금 합계
            </span>

            <strong>
              {formatMoney(
                totalLocalSupport
              )}
            </strong>

          </div>

        </div>


        {/* ===================================================
            지원금 합계
        ==================================================== */}

        <div
          className="info-row comment-row"
          style={{
            display: 'block',
            marginTop: '25px'
          }}
        >

          <span
            className="info-label"
            style={{
              display: 'block',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            지원금 합계
          </span>


          <div
            style={{
              padding: '20px',
              background: '#f8f8f8',
              borderRadius: '6px'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >

              <span>
                신청 금액
              </span>

              <strong>
                {formatMoney(
                  requestedAmount
                )}
              </strong>

            </div>


            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >

              <span>
                회사 지원금
              </span>

              <strong>
                {formatMoney(
                  totalCompanySupport
                )}
              </strong>

            </div>


            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >

              <span>
                지자체 지원금
              </span>

              <strong>
                {formatMoney(
                  totalLocalSupport
                )}
              </strong>

            </div>


            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #ddd'
              }}
            >

              <strong>
                최종 지원금
              </strong>

              <strong
                style={{
                  fontSize: '20px'
                }}
              >
                {formatMoney(
                  grandTotal
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* ===================================================
            첨부파일
        ==================================================== */}

        <div className="file-section info-row">

          <span className="info-label">
            첨부 파일
          </span>


          <div
            className="file-list-wrapper info-value"
          >

            {Array.isArray(detail.fileList) &&
             detail.fileList.length > 0 ? (

              <ul className="file-list">

                {detail.fileList.map(
                  (file, index) => (

                    <li
                      key={
                        file?.amountattachmentNo ||
                        index
                      }
                      className="file-item"
                    >

                      <a
                        href={file?.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        {
                          file?.originName ||
                          '첨부파일'
                        }
                      </a>

                    </li>

                  )
                )}

              </ul>

            ) : (

              <p className="no-file">
                첨부된 파일이 없습니다.
              </p>

            )}

          </div>

        </div>


        {/* ===================================================
            결재 의견
        ==================================================== */}

        <div
          className="info-row"
          style={{
            alignItems: 'flex-start'
          }}
        >

          <span className="info-label">
            결재 의견
          </span>


          <div
            className="info-value"
            style={{
              flex: 1
            }}
          >

            {canEditable ? (

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="결재 의견을 입력하세요."
                rows={4}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: '10px'
                }}
              />

            ) : (

              <span>
                {
                  detail.amountComment ||
                  '결재 의견이 없습니다.'
                }
              </span>

            )}

          </div>

        </div>


        {/* ===================================================
            초과 경고
        ==================================================== */}

        {isOverRequested && (

          <div
            className="warning-text"
            style={{
              marginTop: '10px'
            }}
          >

            ⚠️ 회사 지원금과 지자체 지원금의 합계가
            신청 금액을 초과했습니다.

          </div>

        )}


        {/* ===================================================
            버튼
        ==================================================== */}

        <div
          className="btn-group"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px'
          }}
        >

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            목록으로
          </button>


          {canEditable && (

            <button
              type="submit"
              className="btn btn-primary btn-approve"
              disabled={isOverRequested}
            >
              승인 및 지원금 반영
            </button>

          )}

        </div>


      </form>

    </div>

  );

}


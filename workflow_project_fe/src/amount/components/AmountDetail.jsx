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
  // 승인 정보
  // =========================================================

  const [approvedAmount, setApprovedAmount] = useState('');
  const [comment, setComment] = useState('');

  // =========================================================
  // 지자체 지원금
  // amount_list
  // =========================================================

  const [sponsorName, setSponsorName] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
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
        // amount.approved_amount
        // =====================================================

        setApprovedAmount(
          data?.approvedAmount !== null &&
          data?.approvedAmount !== undefined
            ? String(data.approvedAmount)
            : ''
        );

        // =====================================================
        // amount.amount_comment
        // =====================================================

        setComment(
          data?.amountComment || ''
        );

        // =====================================================
        // amount_list
        // 지자체 지원금
        // =====================================================

        if (
          Array.isArray(data?.sponsorList) &&
          data.sponsorList.length > 0
        ) {

          const sponsor = data.sponsorList[0];

          setSponsorName(
            sponsor?.sponsorName || ''
          );

          setSponsorAmount(
            sponsor?.amount !== null &&
            sponsor?.amount !== undefined
              ? String(sponsor.amount)
              : ''
          );

          setSponsorStatus(
            sponsor?.status || 'UNPAID'
          );

          setRemark(
            sponsor?.remark || ''
          );

        } else {

          setSponsorName('');
          setSponsorAmount('');
          setSponsorStatus('UNPAID');
          setRemark('');

        }

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
  // amount_item 유형
  //
  // DB
  // amountamountitem_type
  //
  // S : 숙박
  // T : 교통
  // E : 체험
  // F : 식비
  // V : 차량
  // O : 기타
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
  // amount_item.item_approved
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
  // amount_list.status
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
  // 수정 / 승인 가능 여부
  //
  // R : 검토중
  // H : 보류
  // =========================================================

  const canEditable =
    detail.status === 'R' ||
    detail.status === 'H';


  // =========================================================
  // 회사 지원금
  //
  // amount_item.amount
  //
  // amount_item에는 cost가 없음.
  // amount 자체가 회사 지원금.
  // =========================================================

  const itemList =
    Array.isArray(detail.itemList)
      ? detail.itemList
      : [];


  const totalCompanySupport =
    itemList.reduce(
      (sum, item) =>
        sum +
        (Number(item?.amount) || 0),
      0
    );


  // =========================================================
  // 지자체 지원금
  //
  // amount_list.amount
  // =========================================================

  const sponsorList =
    Array.isArray(detail.sponsorList)
      ? detail.sponsorList
      : [];


  const totalLocalSupport =
    sponsorList.reduce(
      (sum, sponsor) =>
        sum +
        (Number(sponsor?.amount) || 0),
      0
    );


  // =========================================================
  // 신청 금액
  //
  // amount.requested_amount
  // =========================================================

  const requestedAmount =
    Number(detail.requestedAmount) || 0;


  // =========================================================
  // 현재 승인 금액
  //
  // amount.approved_amount
  // =========================================================

  const currentApprovedAmount =
    canEditable
      ? Number(approvedAmount) || 0
      : Number(detail.approvedAmount) || 0;


  // =========================================================
  // 현재 지자체 지원금
  // =========================================================

  const currentLocalSupport =
    canEditable
      ? Number(sponsorAmount) || 0
      : totalLocalSupport;


  // =========================================================
  // 총 지원금
  //
  // 회사 지원금 + 지자체 지원금
  // =========================================================

  const grandTotal =
    currentApprovedAmount +
    currentLocalSupport;


  // =========================================================
  // 신청 금액 초과 여부
  // =========================================================

  const isOverRequested =
    grandTotal > requestedAmount;


  // =========================================================
  // 승인 처리
  // =========================================================

  const handleApprovalSubmit = async (e) => {

    e.preventDefault();


    // =======================================================
    // 상태 확인
    // =======================================================

    if (!canEditable) {

      alert(
        '검토중 또는 보류 상태의 신청만 승인할 수 있습니다.'
      );

      return;

    }


    // =======================================================
    // 승인 금액
    // =======================================================

    const parsedApprovedAmount =
      Number(approvedAmount);


    // =======================================================
    // 지자체 지원금
    // =======================================================

    const parsedSponsorAmount =
      Number(sponsorAmount || 0);


    // =======================================================
    // 승인 금액 검증
    // =======================================================

    if (
      Number.isNaN(parsedApprovedAmount) ||
      parsedApprovedAmount < 0
    ) {

      alert(
        '올바른 승인 금액을 입력해주세요.'
      );

      return;

    }


    // =======================================================
    // 승인 금액 > 신청 금액
    // =======================================================

    if (
      parsedApprovedAmount >
      requestedAmount
    ) {

      alert(
        `승인 금액은 신청 금액을 초과할 수 없습니다.\n\n` +
        `신청 금액: ${formatMoney(requestedAmount)}\n` +
        `승인 금액: ${formatMoney(parsedApprovedAmount)}`
      );

      return;

    }


    // =======================================================
    // 지자체 지원금 검증
    // =======================================================

    if (
      Number.isNaN(parsedSponsorAmount) ||
      parsedSponsorAmount < 0
    ) {

      alert(
        '올바른 지자체 지원금 금액을 입력해주세요.'
      );

      return;

    }


    // =======================================================
    // 회사 지원금 + 지자체 지원금
    // =======================================================

    const calculatedTotal =
      parsedApprovedAmount +
      parsedSponsorAmount;


    if (
      calculatedTotal >
      requestedAmount
    ) {

      alert(
        `회사 지원금과 지자체 지원금의 합계가 ` +
        `신청 금액을 초과할 수 없습니다.\n\n` +
        `신청 금액: ${formatMoney(requestedAmount)}\n` +
        `회사 지원금: ${formatMoney(parsedApprovedAmount)}\n` +
        `지자체 지원금: ${formatMoney(parsedSponsorAmount)}\n` +
        `총 지원금: ${formatMoney(calculatedTotal)}`
      );

      return;

    }


    // =======================================================
    // 지원기관명
    // =======================================================

    const trimmedSponsorName =
      sponsorName.trim();


    if (
      parsedSponsorAmount > 0 &&
      !trimmedSponsorName
    ) {

      alert(
        '지자체 지원금이 있는 경우 지원기관명을 입력해주세요.'
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
        `신청자: ${detail.empName || '정보 없음'}\n` +
        `신청 금액: ${formatMoney(requestedAmount)}\n\n` +
        `회사 지원금: ${formatMoney(parsedApprovedAmount)}\n` +
        `지자체 지원금: ${formatMoney(parsedSponsorAmount)}\n` +
        `총 지원금: ${formatMoney(calculatedTotal)}`
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
      console.log('amountNo:', detail.amountNo);
      console.log('status:', 'A');
      console.log(
        'approvedAmount:',
        parsedApprovedAmount
      );
      console.log(
        'comment:',
        comment
      );
      console.log(
        'sponsorName:',
        trimmedSponsorName
      );
      console.log(
        'sponsorAmount:',
        parsedSponsorAmount
      );
      console.log(
        'sponsorStatus:',
        sponsorStatus
      );
      console.log(
        'remark:',
        remark
      );
      console.log('=================================');


      await amountApi.updateApproval(

        detail.amountNo,

        'A',

        parsedApprovedAmount,

        comment,

        trimmedSponsorName,

        parsedSponsorAmount,

        sponsorStatus,

        remark

      );


      // =====================================================
      // 완료
      // =====================================================

      alert(
        '승인 및 지원금 반영이 완료되었습니다.'
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
            1. 신청자
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청자
          </span>

          <span className="info-value">
            {detail.empName || '정보 없음'}
          </span>

        </div>


        {/* ===================================================
            2. 신청번호
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청번호
          </span>

          <span className="info-value">
            {detail.amountNo}
          </span>

        </div>


        {/* ===================================================
            3. 워케이션 번호
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            워케이션 번호
          </span>

          <span className="info-value">
            {detail.workcationNo ?? '-'}
          </span>

        </div>


        {/* ===================================================
            4. 상태
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            상태
          </span>

          <span className="info-value">

            <span
              className={
                `status-badge status-${detail.status || 'UNKNOWN'}`
              }
            >
              {getStatusText(detail.status)}
            </span>

          </span>

        </div>


        {/* ===================================================
            5. 신청일
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청일
          </span>

          <span className="info-value">
            {formatDate(detail.requestedAt)}
          </span>

        </div>


        {/* ===================================================
            6. 신청 금액
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청 금액
          </span>

          <span className="info-value">
            {formatMoney(requestedAmount)}
          </span>

        </div>


        {/* ===================================================
            7. 회사 지원금 승인 금액
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            회사 지원금
          </span>

          <span className="info-value">

            {canEditable ? (

              <input
                type="number"
                min="0"
                value={approvedAmount}
                onChange={(e) =>
                  setApprovedAmount(
                    e.target.value
                  )
                }
                className="sponsor-input"
                style={{
                  width: '200px'
                }}
                required
              />

            ) : (

              formatMoney(
                detail.approvedAmount
              )

            )}

          </span>

        </div>


        {/* ===================================================
            8. 비용 항목별 회사 지원금
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
              marginBottom: '12px'
            }}
          >
            비용 항목별 회사 지원금
          </span>


          <div
            className="info-comment"
            style={{
              width: '100%'
            }}
          >

            {itemList.length > 0 ? (

              <>

                {itemList.map(
                  (item, index) => {

                    const companyAmount =
                      Number(item?.amount) || 0;

                    return (

                      <div
                        key={
                          item?.itemNo ||
                          index
                        }
                        className="item-row"
                        style={{
                          padding: '15px 10px',
                          borderBottom:
                            '1px solid #eee'
                        }}
                      >

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >

                          {/* 유형 */}

                          <span
                            className="item-badge"
                            style={{
                              minWidth: '75px',
                              textAlign: 'center'
                            }}
                          >
                            {getItemTypeText(
                              item?.itemType
                            )}
                          </span>


                          {/* 회사 지원금 */}

                          <span
                            style={{
                              minWidth: '170px',
                              fontWeight: 'bold',
                              textAlign: 'right'
                            }}
                          >
                            {formatMoney(
                              companyAmount
                            )}
                          </span>


                          {/* 설명 */}

                          <span
                            className="item-desc"
                            style={{
                              flex: 1
                            }}
                          >
                            {
                              item?.itemDescription ||
                              '설명 없음'
                            }
                          </span>

                        </div>


                        {/* 날짜 */}

                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#777'
                          }}
                        >
                          사용일:{' '}
                          {formatDate(
                            item?.itemDate
                          )}
                        </div>


                        {/* 항목 승인 여부 */}

                        {item?.itemApproved !== null &&
                         item?.itemApproved !== undefined &&
                         item?.itemApproved !== '' && (

                          <div
                            style={{
                              marginTop: '5px',
                              fontSize: '13px',
                              color: '#666'
                            }}
                          >
                            항목 승인:{' '}
                            {getItemApprovedText(
                              item.itemApproved
                            )}
                          </div>

                        )}


                        {/* 연결된 지자체 지원금 */}

                        {sponsorList
                          .filter(
                            sponsor =>
                              sponsor?.itemNo ===
                              item?.itemNo
                          )
                          .map(
                            sponsor => (

                              <div
                                key={
                                  sponsor.amountListNo
                                }
                                style={{
                                  marginTop: '8px',
                                  padding: '8px 10px',
                                  background: '#f7f7f7',
                                  fontSize: '13px'
                                }}
                              >

                                <strong>
                                  지자체 지원금:
                                </strong>

                                {' '}

                                {formatMoney(
                                  sponsor.amount
                                )}

                                {sponsor.sponsorName && (

                                  <span>
                                    {' '}
                                    (
                                    {sponsor.sponsorName}
                                    )
                                  </span>

                                )}

                              </div>

                            )
                          )}

                      </div>

                    );

                  }
                )}


                {/* 회사 지원금 항목 합계 */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: '15px 10px',
                    borderTop:
                      '2px solid #333',
                    fontWeight: 'bold'
                  }}
                >

                  <span
                    style={{
                      marginRight: '20px'
                    }}
                  >
                    회사 지원금 항목 합계
                  </span>

                  <span
                    style={{
                      fontSize: '18px'
                    }}
                  >
                    {formatMoney(
                      totalCompanySupport
                    )}
                  </span>

                </div>

              </>

            ) : (

              <span
                style={{
                  color: '#666'
                }}
              >
                비용 항목이 없습니다.
              </span>

            )}

          </div>

        </div>


        {/* ===================================================
            9. 첨부파일
        ==================================================== */}

        <div className="file-section info-row">

          <span className="info-label">
            첨부 파일
          </span>


          <div className="file-list-wrapper info-value">

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
            10. 결재 의견
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
            11. 지자체 지원금
            amount_list
        ==================================================== */}

        <div
          className="file-section"
          style={{
            marginTop: '20px',
            borderTop: '1px solid #eee',
            paddingTop: '15px',
            flexDirection: 'column'
          }}
        >

          <span
            className="info-label"
            style={{
              marginBottom: '10px',
              width: '100%'
            }}
          >
            지자체 지원금
          </span>


          {/* =================================================
              검토중 / 보류
          ================================================= */}

          {canEditable ? (

            <div className="sponsor-form-box">


              {/* 지원기관 */}

              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  지원기관명:
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
                  placeholder="예: 제주특별자치도"
                />

              </div>


              {/* 지자체 지원금 */}

              <div className="sponsor-input-row">

                <label className="sponsor-label">
                  지원금액:
                </label>

                <input
                  type="number"
                  min="0"
                  value={sponsorAmount}
                  onChange={(e) =>
                    setSponsorAmount(
                      e.target.value
                    )
                  }
                  className="sponsor-input"
                />

              </div>


              {/* 지급상태 */}

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
                    지급
                  </option>

                  <option value="UNPAID">
                    미지급
                  </option>

                  <option value="HOLD">
                    보류
                  </option>

                </select>

              </div>


              {/* 특이사항 */}

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

            </div>

          ) : (

            /* =================================================
               승인 / 반려 / 취소 이후
            ================================================= */

            <div
              style={{
                width: '100%'
              }}
            >

              {sponsorList.length > 0 ? (

                sponsorList.map(
                  (sponsor, index) => (

                    <div
                      key={
                        sponsor?.amountListNo ||
                        index
                      }
                      className="sponsor-card"
                    >

                      <p>

                        <strong>
                          지원기관:
                        </strong>

                        {' '}

                        {
                          sponsor?.sponsorName ||
                          '미지정'
                        }

                      </p>


                      <p>

                        <strong>
                          지자체 지원금:
                        </strong>

                        {' '}

                        {formatMoney(
                          sponsor?.amount
                        )}

                      </p>


                      <p>

                        <strong>
                          지급상태:
                        </strong>

                        {' '}

                        {getSponsorStatusText(
                          sponsor?.status
                        )}

                      </p>


                      {sponsor?.paymentDate && (

                        <p>

                          <strong>
                            지급일:
                          </strong>

                          {' '}

                          {formatDate(
                            sponsor.paymentDate
                          )}

                        </p>

                      )}


                      {sponsor?.remark && (

                        <p>

                          <strong>
                            특이사항:
                          </strong>

                          {' '}

                          {sponsor.remark}

                        </p>

                      )}

                    </div>

                  )
                )

              ) : (

                <p className="no-sponsor-text">
                  적용된 지자체 지원금 내역이 없습니다.
                </p>

              )}

            </div>

          )}

        </div>


        {/* ===================================================
            12. 지원금 합계
        ==================================================== */}

        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f8f8f8',
            borderRadius: '6px'
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}
          >

            <span>
              회사 지원금
            </span>

            <strong>
              {formatMoney(
                currentApprovedAmount
              )}
            </strong>

          </div>


          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >

            <span>
              지자체 지원금
            </span>

            <strong>
              {formatMoney(
                currentLocalSupport
              )}
            </strong>

          </div>

        </div>


        {/* ===================================================
            13. 총 지원금
        ==================================================== */}

        <div className="grand-total-row">

          <span className="grand-total-label">
            총 지원금
          </span>

          <span className="grand-total-value">

            {formatMoney(
              grandTotal
            )}

          </span>

        </div>


        {/* ===================================================
            14. 초과 경고
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
            15. 버튼
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


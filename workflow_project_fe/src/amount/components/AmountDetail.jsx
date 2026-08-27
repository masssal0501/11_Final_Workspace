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
  // 지원금 정보
  // amount_list 기준
  // =========================================================

  const [sponsorName, setSponsorName] =
    useState('회사지원금');

  const [sponsorAmount, setSponsorAmount] =
    useState('');

  const [sponsorStatus, setSponsorStatus] =
    useState('PAID');

  const [remark, setRemark] =
    useState('');


  // =========================================================
  // 상세 조회
  // =========================================================

  useEffect(() => {

    const fetchDetail = async () => {

      try {

        setLoading(true);

        const response =
          await amountApi.getAmountById(amountNo);

        console.log(
          '📌 비용 상세:',
          response
        );

        console.log(
          '📌 신청 정보:',
          {
            amountNo: response?.amountNo,
            requestedAmount:
              response?.requestedAmount,
            approvedAmount:
              response?.approvedAmount,
            status:
              response?.status,
            amountComment:
              response?.amountComment,
            workcationNo:
              response?.workcationNo,
            empName:
              response?.empName
          }
        );

        console.log(
          '📌 비용 항목:',
          response?.itemList
        );

        console.log(
          '📌 첨부파일:',
          response?.fileList
        );

        setDetail(response);

        if (!response) {
          return;
        }


        // =====================================================
        // 승인 금액
        // =====================================================

        setApprovedAmount(
          response.approvedAmount !== null &&
          response.approvedAmount !== undefined
            ? response.approvedAmount
            : response.requestedAmount ?? ''
        );


        // =====================================================
        // 결재 의견
        // amount.amount_comment
        // =====================================================

        setComment(
          response.amountComment ?? ''
        );


        // =====================================================
        // 기존 지원금 조회
        //
        // itemList
        //   └ sponsorList
        //       └ amount_list
        // =====================================================

        const sponsors =
          (response.itemList || [])
            .flatMap(
              item =>
                item.sponsorList || []
            );

        console.log(
          '📌 전체 지원금:',
          sponsors
        );


        if (sponsors.length > 0) {

          // 현재 구조에서는 첫 번째 지원금을
          // 관리자 수정 대상으로 사용

          const firstSponsor =
            sponsors[0];

          setSponsorName(
            firstSponsor.sponsorName ||
            '회사지원금'
          );

          setSponsorAmount(
            firstSponsor.amount ??
            ''
          );

          setSponsorStatus(
            firstSponsor.status ||
            'PAID'
          );

          setRemark(
            firstSponsor.remark ||
            ''
          );
        }

      } catch (error) {

        console.error(
          '❌ 비용 상세 조회 실패:',
          error
        );

        console.error(
          '서버 응답:',
          error.response?.data
        );

        alert(
          error.response?.data?.message ||
          error.response?.data ||
          '데이터를 불러오는 데 실패했습니다.'
        );

      } finally {

        setLoading(false);

      }

    };


    if (amountNo) {
      fetchDetail();
    }

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
  // 비용 유형
  // amount_item.item_type
  // =========================================================

  const getItemTypeText = (itemType) => {

    const typeMap = {
      S: '숙박',
      T: '교통',
      E: '식비',
      F: '체험',
      V: '공간대여',
      O: '기타'
    };

    return (
      typeMap[itemType] ||
      itemType ||
      '기타'
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

    return `${number.toLocaleString()} 원`;

  };


  // =========================================================
  // 수정 가능 여부
  //
  // R = 검토중
  // H = 보류
  // =========================================================

  const canEditable =
    detail.status === 'R' ||
    detail.status === 'H';


  // =========================================================
  // 비용 항목
  // amount_item.cost 합계
  // =========================================================

  const totalItemAmount =
    (detail.itemList || []).reduce(
      (sum, item) =>
        sum +
        (Number(item.cost) || 0),
      0
    );


  // =========================================================
  // 기존 지원금
  //
  // amount_list.amount
  // =========================================================

  const sponsorList =
    (detail.itemList || [])
      .flatMap(
        item =>
          item.sponsorList || []
      );


  const totalExistingSponsorAmount =
    sponsorList.reduce(
      (sum, sponsor) =>
        sum +
        (Number(sponsor.amount) || 0),
      0
    );


  // =========================================================
  // 현재 승인 금액
  // =========================================================

  const currentApproved =
    Number(approvedAmount) || 0;


  // =========================================================
  // 현재 지원금
  // =========================================================

  const currentSponsor =
    canEditable
      ? Number(sponsorAmount) || 0
      : totalExistingSponsorAmount;


  // =========================================================
  // 총 지급 금액
  //
  // 회사 승인 + 지원금
  // =========================================================

  const grandTotal =
    currentApproved +
    currentSponsor;


  // =========================================================
  // 신청 금액
  // =========================================================

  const requestedAmount =
    Number(detail.requestedAmount) || 0;


  // =========================================================
  // 승인 + 지원금 초과 여부
  // =========================================================

  const isOverRequested =
    grandTotal > requestedAmount;


  // =========================================================
  // 승인 처리
  // =========================================================

  const handleApprovalSubmit = async (e) => {

    e.preventDefault();


    const parsedApprovedAmount =
      Number(approvedAmount);

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
    // 신청 금액 초과
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
    // 지원금 검증
    // =======================================================

    if (
      Number.isNaN(parsedSponsorAmount) ||
      parsedSponsorAmount < 0
    ) {

      alert(
        '올바른 지원금 금액을 입력해주세요.'
      );

      return;

    }


    // =======================================================
    // 승인금액 + 지원금
    // =======================================================

    const calculatedTotal =
      parsedApprovedAmount +
      parsedSponsorAmount;


    if (
      calculatedTotal >
      requestedAmount
    ) {

      alert(
        `승인 금액과 지원금의 합계가 ` +
        `신청 금액을 초과할 수 없습니다.\n\n` +
        `신청 금액: ${formatMoney(requestedAmount)}\n` +
        `승인 금액: ${formatMoney(parsedApprovedAmount)}\n` +
        `지원금: ${formatMoney(parsedSponsorAmount)}\n` +
        `합계: ${formatMoney(calculatedTotal)}`
      );

      return;

    }


    // =======================================================
    // 최종 확인
    // =======================================================

    const confirmed =
      window.confirm(
        `비용 신청을 승인하시겠습니까?\n\n` +
        `신청번호: ${detail.amountNo}\n` +
        `신청자: ${detail.empName || '정보 없음'}\n` +
        `신청 금액: ${formatMoney(requestedAmount)}\n` +
        `승인 금액: ${formatMoney(parsedApprovedAmount)}\n` +
        `지원금: ${formatMoney(parsedSponsorAmount)}`
      );


    if (!confirmed) {
      return;
    }


    try {

      // =====================================================
      // AmountServiceImpl
      //
      // updateApprovalWithSponsor(
      //     amountNo,
      //     status,
      //     approvedAmount,
      //     comment,
      //     sponsorName,
      //     sponsorAmount,
      //     sponsorStatus,
      //     remark
      // )
      // =====================================================

      await amountApi.updateApproval(
        detail.amountNo,
        'A',
        parsedApprovedAmount,
        comment,
        sponsorName,
        parsedSponsorAmount,
        sponsorStatus,
        remark
      );


      alert(
        '승인 및 지원금 반영이 완료되었습니다.'
      );


      // 관리자 비용 목록으로 이동
      navigate('/admin/cost/list');

    } catch (error) {

      console.error(
        '❌ 승인 처리 실패:',
        error
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        error.response?.data ||
        '승인 처리에 실패했습니다.'
      );

    }

  };


  // =========================================================
  // 지원금 상태명
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
            3. 상태
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            상태
          </span>

          <span className="info-value">

            <span
              className={
                `status-badge status-${detail.status}`
              }
            >
              {getStatusText(detail.status)}
            </span>

          </span>

        </div>


        {/* ===================================================
            4. 신청일
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
            5. 신청 금액
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            신청 금액
          </span>

          <span className="info-value">
            {formatMoney(detail.requestedAmount)}
          </span>

        </div>


        {/* ===================================================
            6. 승인 금액
        ==================================================== */}

        <div className="info-row">

          <span className="info-label">
            승인 금액
          </span>

          <span className="info-value">

            {canEditable ? (

              <input
                type="number"
                min="0"
                max={requestedAmount}
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
            7. 비용 항목
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
            비용 항목별 지출 내역
          </span>


          <div
            className="info-comment"
            style={{
              width: '100%'
            }}
          >

            {detail.itemList &&
            detail.itemList.length > 0 ? (

              <>

                {detail.itemList.map(
                  (item, index) => {

                    const itemCost =
                      Number(item.cost) || 0;

                    const itemSponsorTotal =
                      (item.sponsorList || [])
                        .reduce(
                          (sum, sponsor) =>
                            sum +
                            (Number(sponsor.amount) || 0),
                          0
                        );

                    return (

                      <div
                        key={
                          item.itemNo ||
                          index
                        }
                        className="item-row"
                        style={{
                          padding:
                            '15px 10px',
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
                              item.itemType
                            )}
                          </span>


                          {/* 금액 */}

                          <span
                            style={{
                              minWidth: '150px',
                              fontWeight: 'bold',
                              textAlign: 'right'
                            }}
                          >
                            {formatMoney(itemCost)}
                          </span>


                          {/* 설명 */}

                          <span
                            className="item-desc"
                            style={{
                              flex: 1
                            }}
                          >
                            {item.itemDescription ||
                              '설명 없음'}
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
                          사용일: {formatDate(item.itemDate)}
                        </div>


                        {/* 항목별 승인 여부 */}

                        {item.itemApproved !== null &&
                         item.itemApproved !== undefined && (

                          <div
                            style={{
                              marginTop: '5px',
                              fontSize: '13px',
                              color: '#666'
                            }}
                          >
                            항목 승인:
                            {' '}
                            {item.itemApproved}
                          </div>

                        )}


                        {/* 항목별 지원금 */}

                        {itemSponsorTotal > 0 && (

                          <div
                            style={{
                              marginTop: '8px',
                              fontSize: '13px',
                              color: '#555'
                            }}
                          >
                            항목 지원금:
                            {' '}
                            {formatMoney(
                              itemSponsorTotal
                            )}
                          </div>

                        )}

                      </div>

                    );

                  }
                )}


                {/* 비용 항목 합계 */}

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
                    비용 항목 합계
                  </span>

                  <span
                    style={{
                      fontSize: '18px'
                    }}
                  >
                    {formatMoney(
                      totalItemAmount
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
            8. 첨부파일
        ==================================================== */}

        <div className="file-section info-row">

          <span className="info-label">
            첨부 파일
          </span>


          <div className="file-list-wrapper info-value">

            {detail.fileList &&
            detail.fileList.length > 0 ? (

              <ul className="file-list">

                {detail.fileList.map(
                  (file) => (

                    <li
                      key={
                        file.amountattachmentNo
                      }
                      className="file-item"
                    >

                      <a
                        href={file.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="file-link"
                      >
                        {file.originName}
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
            9. 결재 의견
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
                {detail.amountComment ||
                  '결재 의견이 없습니다.'}
              </span>

            )}

          </div>

        </div>


        {/* ===================================================
            10. 지원금
        ==================================================== */}

        <div
          className="file-section"
          style={{
            marginTop: '20px',
            borderTop:
              '1px solid #eee',
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
            지원금 관련 정보
          </span>


          {/* =================================================
              수정 가능한 경우
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
                />

              </div>


              {/* 지원금액 */}

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
               승인 완료 후 지원금 표시
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
                        sponsor.amountListNo ||
                        index
                      }
                      className="sponsor-card"
                    >

                      <p>
                        <strong>
                          지원기관:
                        </strong>
                        {' '}
                        {sponsor.sponsorName ||
                          '미지정'}
                      </p>


                      <p>
                        <strong>
                          지원금액:
                        </strong>
                        {' '}
                        {formatMoney(
                          sponsor.amount
                        )}
                      </p>


                      <p>
                        <strong>
                          지급상태:
                        </strong>
                        {' '}
                        {getSponsorStatusText(
                          sponsor.status
                        )}
                      </p>


                      {sponsor.paymentDate && (

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


                      {sponsor.remark && (

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
                  적용된 지원금 내역이 없습니다.
                </p>

              )}

            </div>

          )}

        </div>


        {/* ===================================================
            11. 합계
        ==================================================== */}

        <div className="grand-total-row">

          <span className="grand-total-label">
            총 지급 예정 금액
          </span>

          <span className="grand-total-value">
            {formatMoney(grandTotal)}
          </span>

        </div>


        {/* ===================================================
            12. 초과 경고
        ==================================================== */}

        {isOverRequested && (

          <div
            className="warning-text"
            style={{
              marginTop: '10px'
            }}
          >
            ⚠️ 승인 금액과 지원금의 합계가
            신청 금액을 초과했습니다.
          </div>

        )}


        {/* ===================================================
            13. 버튼
        ==================================================== */}

        <div
          className="btn-group"
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
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
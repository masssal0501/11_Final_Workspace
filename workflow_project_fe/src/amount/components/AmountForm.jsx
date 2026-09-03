import { useState } from 'react';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountForm({
  workcationNo,
  onSuccess
}) {

  // =========================================================
  // 1. 비용 상세 항목
  //
  // amount_item.amount
  //   → 신청금액
  //
  // amount_item.item_approved_amount
  //   → 회사 지원금
  //   → 신청 화면에서는 입력하지 않음
  //   → 관리자 승인 시 입력
  // =========================================================
  const [itemList, setItemList] = useState([
    {
      tempId: Date.now(),
      amountamountitemType: 'S',
      amount: '',
      itemDate: '',
      itemDescription: ''
    }
  ]);


  // =========================================================
  // 2. 지자체 지원금
  //
  // amount_list
  // 현재 DB PK가 amount_no이므로
  // 신청 건당 1건 사용
  // =========================================================
  const [sponsor, setSponsor] = useState({
    sponsorName: '',
    amount: '',
    status: 'UNPAID',
    paymentDate: null,
    remark: ''
  });


  const [hasLocalSupport, setHasLocalSupport] =
    useState(false);


  // =========================================================
  // 3. 신청 사유 / 파일
  // =========================================================
  const [amountComment, setAmountComment] =
    useState('');

  const [files, setFiles] = useState([]);


  // =========================================================
  // 비용 항목
  // =========================================================
  const typeMap = {
    S: '숙박',
    T: '교통',
    E: '체험',
    F: '식비',
    V: '차량',
    O: '기타'
  };


  // =========================================================
  // 금액 표시
  // =========================================================
  const formatMoney = (value) => {

    const number = Number(value) || 0;

    return `${number.toLocaleString('ko-KR')} 원`;
  };


  // =========================================================
  // 신청금액 합계
  //
  // amount_item.amount 합계
  // =========================================================
  const totalRequestedAmount =
    itemList.reduce(
      (sum, item) =>
        sum + (Number(item.amount) || 0),
      0
    );


  // =========================================================
  // 지자체 지원금
  // =========================================================
  const totalLocalSupport =
    hasLocalSupport
      ? Number(sponsor.amount) || 0
      : 0;


  // =========================================================
  // 신청 단계에서는 회사 지원금이 없음
  //
  // 회사 지원금은 관리자 승인 시
  // item_approved_amount에 입력
  // =========================================================
  const totalCompanySupport = 0;


  // =========================================================
  // 현재 신청 화면에서의 전체 지원금
  //
  // 신청 시점에는 지자체 지원금만 존재
  // =========================================================
  const grandTotal =
    totalCompanySupport +
    totalLocalSupport;


  // =========================================================
  // 비용 항목 추가
  // =========================================================
  const handleAddItem = () => {

    setItemList(prev => [
      ...prev,

      {
        tempId: Date.now() + Math.random(),
        amountamountitemType: 'S',
        amount: '',
        itemDate: '',
        itemDescription: ''
      }
    ]);
  };


  // =========================================================
  // 비용 항목 삭제
  // =========================================================
  const handleRemoveItem = (tempId) => {

    if (itemList.length <= 1) {

      alert(
        '비용 항목은 최소 1개가 필요합니다.'
      );

      return;
    }

    setItemList(prev =>
      prev.filter(
        item => item.tempId !== tempId
      )
    );
  };


  // =========================================================
  // 비용 항목 수정
  // =========================================================
  const handleItemChange = (
    tempId,
    field,
    value
  ) => {

    setItemList(prev =>
      prev.map(item =>
        item.tempId === tempId
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };


  // =========================================================
  // 지자체 지원금 사용
  // =========================================================
  const handleEnableLocalSupport = () => {

    setHasLocalSupport(true);
  };


  // =========================================================
  // 지자체 지원금 해제
  // =========================================================
  const handleRemoveLocalSupport = () => {

    setHasLocalSupport(false);

    setSponsor({
      sponsorName: '',
      amount: '',
      status: 'UNPAID',
      paymentDate: null,
      remark: ''
    });
  };


  // =========================================================
  // 지자체 지원금 입력
  // =========================================================
  const handleSponsorChange = (
    field,
    value
  ) => {

    setSponsor(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // =========================================================
  // 파일 선택
  // =========================================================
  const handleFileChange = (e) => {

    const selectedFiles =
      Array.from(
        e.target.files || []
      );

    setFiles(selectedFiles);
  };


  // =========================================================
  // 제출
  // =========================================================
  const handleSubmit = async (e) => {

    e.preventDefault();


    // -------------------------------------------------------
    // workcationNo 확인
    // -------------------------------------------------------
    if (!workcationNo) {

      alert(
        '워케이션 정보가 없습니다.'
      );

      return;
    }


    // -------------------------------------------------------
    // 비용 항목 확인
    // -------------------------------------------------------
    if (itemList.length === 0) {

      alert(
        '비용 항목을 최소 1개 이상 입력해주세요.'
      );

      return;
    }


    // -------------------------------------------------------
    // 비용 항목 검증
    // -------------------------------------------------------
    for (
      let i = 0;
      i < itemList.length;
      i++
    ) {

      const item = itemList[i];


      // 신청금액
      if (
        item.amount === '' ||
        Number(item.amount) <= 0
      ) {

        alert(
          `${i + 1}번째 ${typeMap[item.amountamountitemType] || '비용 항목'}의 신청금액을 입력해주세요.`
        );

        return;
      }


      // 사용일
      if (!item.itemDate) {

        alert(
          `${i + 1}번째 비용 항목의 사용일을 입력해주세요.`
        );

        return;
      }


      // 설명
      if (
        !item.itemDescription ||
        !item.itemDescription.trim()
      ) {

        alert(
          `${i + 1}번째 비용 항목의 설명을 입력해주세요.`
        );

        return;
      }
    }


    // -------------------------------------------------------
    // 신청금액 확인
    // -------------------------------------------------------
    if (totalRequestedAmount <= 0) {

      alert(
        '신청금액이 0원입니다.'
      );

      return;
    }


    // -------------------------------------------------------
    // 지자체 지원금 검증
    // -------------------------------------------------------
    if (hasLocalSupport) {

      const localAmount =
        Number(sponsor.amount);


      if (
        sponsor.amount === '' ||
        Number.isNaN(localAmount) ||
        localAmount < 0
      ) {

        alert(
          '지자체 지원금 금액을 입력해주세요.'
        );

        return;
      }


      // 지자체 지원금이 신청금액보다 클 수 없음
      if (
        localAmount >
        totalRequestedAmount
      ) {

        alert(
          `지자체 지원금은 신청금액을 초과할 수 없습니다.\n\n` +
          `신청금액: ${formatMoney(totalRequestedAmount)}\n` +
          `지자체 지원금: ${formatMoney(localAmount)}`
        );

        return;
      }


      // 지원금이 0보다 크면 기관명 필수
      if (
        localAmount > 0 &&
        !sponsor.sponsorName.trim()
      ) {

        alert(
          '지원기관명을 입력해주세요.'
        );

        return;
      }
    }


    // -------------------------------------------------------
    // 파일 확인
    // -------------------------------------------------------
    if (files.length === 0) {

      alert(
        '영수증 또는 증빙 파일을 최소 1개 첨부해주세요.'
      );

      return;
    }


    // -------------------------------------------------------
    // 최종 확인
    // -------------------------------------------------------
    const confirmed =
      window.confirm(
        `비용 정산 신청을 제출하시겠습니까?\n\n` +

        `신청금액: ${formatMoney(totalRequestedAmount)}\n` +

        `지자체 지원금: ${formatMoney(totalLocalSupport)}\n\n` +

        `※ 회사 지원금은 관리자 승인 단계에서 결정됩니다.`
      );


    if (!confirmed) {
      return;
    }


    // =======================================================
    // API 요청 데이터
    // =======================================================
    const requestData = {

      // -----------------------------------------------------
      // amount
      // -----------------------------------------------------
      workcationNo:
        Number(workcationNo),

      requestedAmount:
        totalRequestedAmount,

      amountComment:
        amountComment.trim(),


      // -----------------------------------------------------
      // amount_item
      //
      // amount
      //   → 신청금액
      //
      // itemApprovedAmount
      //   → 회사 지원금
      //   → 신청 시 0
      // -----------------------------------------------------
      itemList:
        itemList.map(item => ({

          amountamountitemType:
            item.amountamountitemType,

          amount:
            Number(item.amount),

          itemApprovedAmount:
            0,

          itemDate:
            item.itemDate,

          itemDescription:
            item.itemDescription.trim()
        })),


      // -----------------------------------------------------
      // amount_list
      // -----------------------------------------------------
      sponsor:
        hasLocalSupport
          ? {

              sponsorName:
                sponsor.sponsorName.trim(),

              amount:
                Number(sponsor.amount) || 0,

              paymentDate:
                sponsor.paymentDate,

              status:
                sponsor.status,

              remark:
                sponsor.remark.trim()

            }
          : null,


      // -----------------------------------------------------
      // amount_file
      // -----------------------------------------------------
      files
    };


    console.log(
      '================================='
    );

    console.log(
      '📌 비용 정산 신청 데이터'
    );

    console.log(
      requestData
    );

    console.log(
      '📌 총 신청금액:',
      totalRequestedAmount
    );

    console.log(
      '📌 지자체 지원금:',
      totalLocalSupport
    );

    console.log(
      '================================='
    );


    // =======================================================
    // API 요청
    // =======================================================
    try {

      const createdAmountNo =
        await amountApi.createAmount(
          requestData
        );


      alert(
        '비용 정산 신청이 완료되었습니다.'
      );


      if (onSuccess) {

        onSuccess(
          createdAmountNo
        );
      }


    } catch (error) {

      console.error(
        '❌ 비용 정산 신청 실패:',
        error
      );

      console.error(
        '❌ 서버 응답:',
        error?.response?.data
      );

      alert(
        error?.response?.data?.message ||
        '비용 정산 신청 중 오류가 발생했습니다.'
      );
    }
  };


  // =========================================================
  // JSX
  // =========================================================
  return (

    <div className="amount-container">

      <h2 className="amount-title">
        비용 정산 신청
      </h2>


      <form
        className="detail-box"
        onSubmit={handleSubmit}
      >


        {/* ================================================= */}
        {/* 1. 비용 상세 항목 */}
        {/* ================================================= */}
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
            비용 상세 항목
          </span>


          <div className="amount-form-item-table-wrap">

            <table className="amount-form-item-table">

              <colgroup>

                <col
                  style={{
                    width: '120px'
                  }}
                />

                <col
                  style={{
                    width: '280px'
                  }}
                />

                <col
                  style={{
                    width: '150px'
                  }}
                />

                <col
                  style={{
                    width: '160px'
                  }}
                />

                <col
                  style={{
                    width: '80px'
                  }}
                />

              </colgroup>


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
                    신청금액
                  </th>

                  <th>
                    관리
                  </th>

                </tr>

              </thead>


              <tbody>

                {itemList.map(item => (

                  <tr
                    key={item.tempId}
                  >

                    {/* 비용 항목 */}
                    <td>

                      <select
                        value={
                          item.amountamountitemType
                        }
                        onChange={e =>
                          handleItemChange(
                            item.tempId,
                            'amountamountitemType',
                            e.target.value
                          )
                        }
                        className="amount-item-select"
                      >

                        <option value="S">
                          숙박
                        </option>

                        <option value="T">
                          교통
                        </option>

                        <option value="E">
                          체험
                        </option>

                        <option value="F">
                          식비
                        </option>

                        <option value="V">
                          차량
                        </option>

                        <option value="O">
                          기타
                        </option>

                      </select>

                    </td>


                    {/* 설명 */}
                    <td>

                      <input
                        type="text"
                        value={
                          item.itemDescription
                        }
                        onChange={e =>
                          handleItemChange(
                            item.tempId,
                            'itemDescription',
                            e.target.value
                          )
                        }
                        className="amount-item-description"
                        placeholder="비용 설명"
                      />

                    </td>


                    {/* 사용일 */}
                    <td>

                      <input
                        type="date"
                        value={
                          item.itemDate
                        }
                        onChange={e =>
                          handleItemChange(
                            item.tempId,
                            'itemDate',
                            e.target.value
                          )
                        }
                        className="amount-item-date"
                      />

                    </td>


                    {/* 신청금액 */}
                    <td>

                      <input
                        type="number"
                        min="0"
                        value={
                          item.amount
                        }
                        onChange={e =>
                          handleItemChange(
                            item.tempId,
                            'amount',
                            e.target.value
                          )
                        }
                        className="amount-item-amount"
                        placeholder="신청금액"
                      />

                    </td>


                    {/* 관리 */}
                    <td>

                      {itemList.length > 1 && (

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                            handleRemoveItem(
                              item.tempId
                            )
                          }
                        >
                          삭제
                        </button>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* 비용 항목 추가 */}
          <div
            style={{
              marginTop: '15px',
              textAlign: 'right'
            }}
          >

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddItem}
            >
              + 비용 항목 추가
            </button>

          </div>


          {/* 신청금액 합계 */}
          <div className="amount-support-summary">

            <span>
              신청금액 합계
            </span>

            <strong>
              {formatMoney(
                totalRequestedAmount
              )}
            </strong>

          </div>

        </div>


        {/* ================================================= */}
        {/* 2. 지자체 지원금 */}
        {/* ================================================= */}
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
            지자체 지원금
          </span>


          {!hasLocalSupport ? (

            <div
              style={{
                textAlign: 'right'
              }}
            >

              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  handleEnableLocalSupport
                }
              >
                + 지자체 지원금 입력
              </button>

            </div>

          ) : (

            <>

              <div className="sponsor-form-box">


                {/* 지원기관 */}
                <div className="sponsor-input-row">

                  <label className="sponsor-label">
                    지원기관
                  </label>

                  <input
                    type="text"
                    value={
                      sponsor.sponsorName
                    }
                    onChange={e =>
                      handleSponsorChange(
                        'sponsorName',
                        e.target.value
                      )
                    }
                    className="sponsor-input-flex"
                    placeholder="지원기관명"
                  />

                </div>


                {/* 지원금 */}
                <div className="sponsor-input-row">

                  <label className="sponsor-label">
                    지원금
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      sponsor.amount
                    }
                    onChange={e =>
                      handleSponsorChange(
                        'amount',
                        e.target.value
                      )
                    }
                    className="sponsor-input"
                    placeholder="지원금액"
                  />

                </div>


                {/* 지급 상태 */}
                <div className="sponsor-input-row">

                  <label className="sponsor-label">
                    지급 상태
                  </label>

                  <select
                    value={
                      sponsor.status
                    }
                    onChange={e =>
                      handleSponsorChange(
                        'status',
                        e.target.value
                      )
                    }
                    className="sponsor-select"
                  >

                    <option value="UNPAID">
                      미지급
                    </option>

                    <option value="PAID">
                      지급완료
                    </option>

                    <option value="HOLD">
                      보류
                    </option>

                  </select>

                </div>


                {/* 비고 */}
                <div className="sponsor-input-row">

                  <label className="sponsor-label">
                    비고
                  </label>

                  <input
                    type="text"
                    value={
                      sponsor.remark
                    }
                    onChange={e =>
                      handleSponsorChange(
                        'remark',
                        e.target.value
                      )
                    }
                    className="sponsor-input-flex"
                    placeholder="비고"
                  />

                </div>


                {/* 삭제 */}
                <div
                  style={{
                    marginTop: '12px',
                    textAlign: 'right'
                  }}
                >

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      handleRemoveLocalSupport
                    }
                  >
                    지자체 지원금 삭제
                  </button>

                </div>

              </div>


              {/* 지자체 지원금 표시 */}
              <div
                className="amount-form-item-table-wrap"
                style={{
                  marginTop: '15px'
                }}
              >

                <table
                  className="amount-form-item-table"
                >

                  <colgroup>

                    <col
                      style={{
                        width: '25%'
                      }}
                    />

                    <col
                      style={{
                        width: '20%'
                      }}
                    />

                    <col
                      style={{
                        width: '20%'
                      }}
                    />

                    <col
                      style={{
                        width: '25%'
                      }}
                    />

                    <col
                      style={{
                        width: '10%'
                      }}
                    />

                  </colgroup>


                  <thead>

                    <tr>

                      <th>
                        지원기관
                      </th>

                      <th>
                        지원금
                      </th>

                      <th>
                        상태
                      </th>

                      <th>
                        비고
                      </th>

                      <th>
                        관리
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    <tr>

                      <td>
                        {sponsor.sponsorName || '-'}
                      </td>

                      <td>
                        {formatMoney(
                          sponsor.amount
                        )}
                      </td>

                      <td>

                        {sponsor.status === 'PAID'
                          ? '지급완료'
                          : sponsor.status === 'HOLD'
                            ? '보류'
                            : '미지급'}

                      </td>

                      <td>
                        {sponsor.remark || '-'}
                      </td>

                      <td
                        style={{
                          textAlign: 'center'
                        }}
                      >

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={
                            handleRemoveLocalSupport
                          }
                        >
                          삭제
                        </button>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </>

          )}


          {/* 지자체 지원금 합계 */}
          <div
            className="amount-support-summary"
            style={{
              marginTop: '15px'
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


        {/* ================================================= */}
        {/* 3. 금액 합계 */}
        {/* ================================================= */}
        <div className="info-row">

          <span className="info-label">
            금액 합계
          </span>


          <div className="info-value">


            {/* 신청금액 */}
            <div className="grand-total-row">

              <span>
                신청금액
              </span>

              <strong>
                {formatMoney(
                  totalRequestedAmount
                )}
              </strong>

            </div>


            {/* 지자체 지원금 */}
            <div
              className="grand-total-row"
              style={{
                marginTop: '10px'
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


            {/* 전체 지원금 */}
            <div
              className="grand-total-row"
              style={{
                marginTop: '10px'
              }}
            >

              <span>
                현재 입력된 지원금
              </span>

              <strong>
                {formatMoney(
                  grandTotal
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* 4. 첨부 파일 */}
        {/* ================================================= */}
        <div className="file-section info-row">

          <span className="info-label">
            첨부 파일
          </span>


          <div className="info-value">

            <input
              type="file"
              multiple
              onChange={
                handleFileChange
              }
            />


            {files.length > 0 && (

              <div className="file-list">

                {files.map(
                  (file, index) => (

                    <div
                      className="file-item"
                      key={`${file.name}-${index}`}
                    >
                      {file.name}
                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* ================================================= */}
        {/* 5. 신청 사유 */}
        {/* ================================================= */}
        <div className="info-row comment-row">

          <span className="info-label">
            신청 사유
          </span>


          <div className="info-value">

            <textarea
              value={
                amountComment
              }
              onChange={e =>
                setAmountComment(
                  e.target.value
                )
              }
              className="info-comment"
              placeholder="비용 정산 신청 사유를 입력해주세요."
              rows="5"
            />

          </div>

        </div>


        {/* ================================================= */}
        {/* 6. 버튼 */}
        {/* ================================================= */}
        <div className="btn-group">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              window.history.back()
            }
          >
            취소
          </button>


          <button
            type="submit"
            className="btn btn-primary"
          >
            비용 정산 신청
          </button>

        </div>

      </form>

    </div>
  );
}
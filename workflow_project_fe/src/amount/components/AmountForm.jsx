import { useState } from 'react';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountForm({
  workcationNo,
  onSuccess
}) {

  // =========================================================
  // 1. 비용 상세 항목
  // amount_item.amount = 회사 지원금
  // =========================================================
  const [itemList, setItemList] = useState([
    {
      tempId: Date.now(),
      itemType: 'S',
      amount: '',
      itemDate: '',
      itemDescription: ''
    }
  ]);

  // =========================================================
  // 2. 지자체 지원금
  // amount_list
  // =========================================================
  const [localSupportRows, setLocalSupportRows] = useState([]);

  const [sponsorName, setSponsorName] = useState('');
  const [localSupportAmount, setLocalSupportAmount] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState('UNPAID');
  const [remark, setRemark] = useState('');

  // =========================================================
  // 3. 신청 사유 / 파일
  // =========================================================
  const [amountComment, setAmountComment] = useState('');
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
  // 회사 지원금
  // amount_item.amount의 합계
  // =========================================================
  const totalCompanySupport = itemList.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  // =========================================================
  // 신청 금액
  // 현재 DB 구조에서는 회사 지원금 합계를 신청 금액으로 사용
  // =========================================================
  const requestedAmount = totalCompanySupport;

  // =========================================================
  // 지자체 지원금 합계
  // =========================================================
  const totalLocalSupport = localSupportRows.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  // =========================================================
  // 전체 지원금
  // 회사 지원금 + 지자체 지원금
  // =========================================================
  const grandTotal =
    totalCompanySupport + totalLocalSupport;

  // =========================================================
  // 비용 항목 추가
  // =========================================================
  const handleAddItem = () => {
    setItemList(prev => [
      ...prev,
      {
        tempId: Date.now() + Math.random(),
        itemType: 'S',
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
      alert('비용 항목은 최소 1개가 필요합니다.');
      return;
    }

    setItemList(prev =>
      prev.filter(item => item.tempId !== tempId)
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
  // 지자체 지원금 추가
  // 신청금액과 관계없이 추가 가능
  // =========================================================
  const handleAddLocalSupport = () => {

    const amount = Number(localSupportAmount);

    // 금액 입력 확인
    if (
      localSupportAmount === '' ||
      Number.isNaN(amount) ||
      amount < 0
    ) {
      alert('지자체 지원금 금액을 입력해주세요.');
      return;
    }

    // 지원금이 있는 경우 지원기관명 필수
    if (amount > 0 && !sponsorName.trim()) {
      alert('지원기관명을 입력해주세요.');
      return;
    }

    // =======================================================
    // 중요
    // 기존에는
    //
    // const newTotal =
    //   totalCompanySupport +
    //   totalLocalSupport +
    //   amount;
    //
    // if (newTotal > requestedAmount) {
    //   ...
    // }
    //
    // 로 제한했지만,
    // 지자체 지원금은 회사 신청금액과 별개의 외부 지원금이므로
    // 여기서는 제한하지 않는다.
    // =======================================================

    const newRow = {
      tempId: `TEMP-${Date.now()}-${Math.random()}`,
      sponsorName: sponsorName.trim(),
      amount,
      status: sponsorStatus,
      paymentDate: null,
      remark: remark.trim()
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
  };

  // =========================================================
  // 지자체 지원금 삭제
  // =========================================================
  const handleRemoveLocalSupport = (tempId) => {

    setLocalSupportRows(prev =>
      prev.filter(row => row.tempId !== tempId)
    );
  };

  // =========================================================
  // 파일 선택
  // =========================================================
  const handleFileChange = (e) => {

    const selectedFiles =
      Array.from(e.target.files || []);

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
      alert('워케이션 정보가 없습니다.');
      return;
    }

    // -------------------------------------------------------
    // 비용 항목 확인
    // -------------------------------------------------------
    if (itemList.length === 0) {
      alert('비용 항목을 최소 1개 이상 입력해주세요.');
      return;
    }

    // -------------------------------------------------------
    // 각 비용 항목 검증
    // -------------------------------------------------------
    for (let i = 0; i < itemList.length; i++) {

      const item = itemList[i];

      if (
        item.amount === '' ||
        Number(item.amount) <= 0
      ) {
        alert(
          `${i + 1}번째 비용 항목의 금액을 입력해주세요.`
        );
        return;
      }

      if (!item.itemDate) {
        alert(
          `${i + 1}번째 비용 항목의 사용일을 입력해주세요.`
        );
        return;
      }

      if (!item.itemDescription.trim()) {
        alert(
          `${i + 1}번째 비용 항목의 설명을 입력해주세요.`
        );
        return;
      }
    }

    // -------------------------------------------------------
    // 신청 금액 확인
    // -------------------------------------------------------
    if (requestedAmount <= 0) {
      alert('신청 금액이 0원입니다.');
      return;
    }

    // -------------------------------------------------------
    // 중요
    // 지자체 지원금은 신청금액을 초과해도 허용
    //
    // 기존:
    // if (grandTotal > requestedAmount) {
    //   alert(...);
    //   return;
    // }
    //
    // 위 제한 제거
    // -------------------------------------------------------

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
    // 본인 부담금 표시 제거
    // -------------------------------------------------------
    const confirmed = window.confirm(
      `비용 정산 신청을 제출하시겠습니까?\n\n` +
      `신청 금액: ${formatMoney(requestedAmount)}\n` +
      `회사 지원금: ${formatMoney(totalCompanySupport)}\n` +
      `지자체 지원금: ${formatMoney(totalLocalSupport)}\n` +
      `전체 지원금: ${formatMoney(grandTotal)}`
    );

    if (!confirmed) {
      return;
    }

    // -------------------------------------------------------
    // API 요청 데이터
    // -------------------------------------------------------
    const requestData = {

      workcationNo: Number(workcationNo),

      // amount.requested_amount
      requestedAmount: requestedAmount,

      // amount.amount_comment
      amountComment:
        amountComment.trim(),

      // =====================================================
      // amount_item
      // item.amount = 회사 지원금
      // =====================================================
      itemList: itemList.map(item => ({
        itemType: item.itemType,
        amount: Number(item.amount),
        itemDate: item.itemDate,
        itemDescription:
          item.itemDescription.trim()
      })),

      // =====================================================
      // amount_list
      // 지자체 지원금
      // =====================================================
      sponsorList: localSupportRows.map(row => ({
        sponsorName: row.sponsorName,
        amount: Number(row.amount) || 0,
        status: row.status,
        paymentDate: row.paymentDate,
        remark: row.remark
      })),

      // =====================================================
      // amount_file
      // =====================================================
      files
    };

    console.log(
      '비용 정산 신청 데이터:',
      requestData
    );

    try {

      const createdAmountNo =
        await amountApi.createAmount(requestData);

      alert(
        '비용 정산 신청이 완료되었습니다.'
      );

      if (onSuccess) {
        onSuccess(createdAmountNo);
      }

    } catch (error) {

      console.error(
        '비용 정산 신청 실패:',
        error
      );

      console.error(
        '서버 응답:',
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
          style={{ display: 'block' }}
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
                <col style={{ width: '120px' }} />
                <col style={{ width: '280px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '160px' }} />
                <col style={{ width: '80px' }} />
              </colgroup>

              <thead>
                <tr>
                  <th>비용 항목</th>
                  <th>설명</th>
                  <th>사용일</th>
                  <th>회사 지원금</th>
                  <th>관리</th>
                </tr>
              </thead>

              <tbody>

                {itemList.map((item) => (

                  <tr key={item.tempId}>

                    {/* 비용 항목 */}
                    <td>

                      <select
                        value={item.itemType}
                        onChange={(e) =>
                          handleItemChange(
                            item.tempId,
                            'itemType',
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
                        value={item.itemDescription}
                        onChange={(e) =>
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
                        value={item.itemDate}
                        onChange={(e) =>
                          handleItemChange(
                            item.tempId,
                            'itemDate',
                            e.target.value
                          )
                        }
                        className="amount-item-date"
                      />

                    </td>

                    {/* 회사 지원금 */}
                    <td>

                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(
                            item.tempId,
                            'amount',
                            e.target.value
                          )
                        }
                        className="amount-item-amount"
                        placeholder="금액"
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

          {/* 추가 버튼 */}
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

          {/* 회사 지원금 합계 */}
          <div className="amount-support-summary">

            <span>
              회사 지원금 합계
            </span>

            <strong>
              {formatMoney(totalCompanySupport)}
            </strong>

          </div>

        </div>


        {/* ================================================= */}
        {/* 2. 지자체 지원금 */}
        {/* ================================================= */}
        <div
          className="info-row comment-row"
          style={{ display: 'block' }}
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

          {/* 입력 영역 */}
          <div className="sponsor-form-box">

            <div className="sponsor-input-row">

              <label className="sponsor-label">
                지원기관
              </label>

              <input
                type="text"
                value={sponsorName}
                onChange={(e) =>
                  setSponsorName(e.target.value)
                }
                className="sponsor-input-flex"
                placeholder="지원기관명"
              />

            </div>


            <div className="sponsor-input-row">

              <label className="sponsor-label">
                지원금
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
                placeholder="지원금액"
              />

            </div>


            <div className="sponsor-input-row">

              <label className="sponsor-label">
                지급 상태
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


            <div className="sponsor-input-row">

              <label className="sponsor-label">
                비고
              </label>

              <input
                type="text"
                value={remark}
                onChange={(e) =>
                  setRemark(e.target.value)
                }
                className="sponsor-input-flex"
                placeholder="비고"
              />

            </div>


            <div
              style={{
                marginTop: '12px',
                textAlign: 'right'
              }}
            >

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddLocalSupport}
              >
                + 지원금 추가
              </button>

            </div>

          </div>


          {/* 지자체 지원금 목록 */}
          {localSupportRows.length > 0 && (

            <div
              className="amount-form-item-table-wrap"
              style={{
                marginTop: '15px'
              }}
            >

              <table className="amount-form-item-table">

                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '10%' }} />
                </colgroup>

                <thead>
                  <tr>
                    <th>지원기관</th>
                    <th>지원금</th>
                    <th>상태</th>
                    <th>비고</th>
                    <th>관리</th>
                  </tr>
                </thead>

                <tbody>

                  {localSupportRows.map(row => (

                    <tr key={row.tempId}>

                      <td>
                        {row.sponsorName || '-'}
                      </td>

                      <td>
                        {formatMoney(row.amount)}
                      </td>

                      <td>
                        {row.status === 'PAID'
                          ? '지급완료'
                          : row.status === 'HOLD'
                            ? '보류'
                            : '미지급'}
                      </td>

                      <td>
                        {row.remark || '-'}
                      </td>

                      <td
                        style={{
                          textAlign: 'center'
                        }}
                      >

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                            handleRemoveLocalSupport(
                              row.tempId
                            )
                          }
                        >
                          삭제
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

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
              {formatMoney(totalLocalSupport)}
            </strong>

          </div>

        </div>


        {/* ================================================= */}
        {/* 3. 지원금 합계 */}
        {/* ================================================= */}
        <div className="info-row">

          <span className="info-label">
            지원금 합계
          </span>

          <div className="info-value">

            {/* 회사 지원금 */}
            <div className="grand-total-row">

              <span>
                회사 지원금
              </span>

              <strong>
                {formatMoney(totalCompanySupport)}
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
                {formatMoney(totalLocalSupport)}
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
                전체 지원금
              </span>

              <strong>
                {formatMoney(grandTotal)}
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
              onChange={handleFileChange}
            />

            {files.length > 0 && (

              <div className="file-list">

                {files.map((file, index) => (

                  <div
                    className="file-item"
                    key={`${file.name}-${index}`}
                  >
                    {file.name}
                  </div>

                ))}

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
              value={amountComment}
              onChange={(e) =>
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


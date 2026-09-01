import React, { useEffect, useState } from 'react';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountForm({
  workcationNo,
  onSuccess
}) {

  // =========================================================
  // Amount VO 기준
  //
  // Amount
  // - workcationNo
  // - requestedAmount
  // - amountComment
  // - itemList
  // - files
  //
  // Amount.Item
  // - itemType
  // - amount
  // - itemDate
  // - itemDescription
  //
  // 서버에서 자동 처리되는 값
  // - amountNo
  // - approvedAmount
  // - requestedAt
  // - approvedAt
  // - createdAt
  // - updatedAt
  // - status
  // - itemNo
  // - itemApproved
  // =========================================================


  // =========================================================
  // 기본 비용 항목
  // =========================================================

  const createEmptyItem = () => ({
    itemType: 'S',
    amount: '',
    itemDate: '',
    itemDescription: ''
  });


  // =========================================================
  // 폼 데이터
  // =========================================================

  const [formData, setFormData] = useState({

    workcationNo: workcationNo || '',

    requestedAmount: 0,

    amountComment: '',

    itemList: [
      createEmptyItem()
    ],

    files: []

  });


  // =========================================================
  // workcationNo 변경
  // =========================================================

  useEffect(() => {

    setFormData((prev) => ({

      ...prev,

      workcationNo: workcationNo || ''

    }));

  }, [workcationNo]);


  // =========================================================
  // 비용 항목 추가
  // =========================================================

  const handleAddItem = () => {

    setFormData((prev) => ({

      ...prev,

      itemList: [
        ...prev.itemList,
        createEmptyItem()
      ]

    }));

  };


  // =========================================================
  // 비용 항목 삭제
  // =========================================================

  const handleRemoveItem = (index) => {

    if (formData.itemList.length <= 1) {

      alert(
        '비용 항목은 최소 1개 이상 입력해야 합니다.'
      );

      return;

    }

    setFormData((prev) => ({

      ...prev,

      itemList: prev.itemList.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )

    }));

  };


  // =========================================================
  // Amount 기본 필드 변경
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value

    }));

  };


  // =========================================================
  // Amount.Item 필드 변경
  // =========================================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {

    setFormData((prev) => {

      const updatedItems = [
        ...prev.itemList
      ];

      updatedItems[index] = {

        ...updatedItems[index],

        [field]: value

      };

      return {

        ...prev,

        itemList: updatedItems

      };

    });

  };


  // =========================================================
  // 파일 변경
  // =========================================================

  const handleFileChange = (e) => {

    const files = Array.from(
      e.target.files || []
    );

    setFormData((prev) => ({

      ...prev,

      files

    }));

  };


  // =========================================================
  // 비용 항목 합계
  //
  // Amount.requestedAmount
  // =
  // Amount.itemList[].amount 합계
  // =========================================================

  const getItemTotal = () => {

    return formData.itemList.reduce(
      (sum, item) => {

        const amount =
          Number(item.amount);

        return sum +
          (
            Number.isFinite(amount)
              ? amount
              : 0
          );

      },
      0
    );

  };


  // =========================================================
  // 총 신청 금액
  // =========================================================

  const requestedAmount =
    getItemTotal();


  // =========================================================
  // 금액 포맷
  // =========================================================

  const formatMoney = (value) => {

    const number =
      Number(value) || 0;

    return number.toLocaleString(
      'ko-KR'
    );

  };


  // =========================================================
  // 제출
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // =======================================================
    // 1. workcationNo
    // =======================================================

    if (
      formData.workcationNo === null ||
      formData.workcationNo === undefined ||
      formData.workcationNo === ''
    ) {

      alert(
        '워케이션 정보가 없습니다.'
      );

      return;

    }


    // =======================================================
    // 2. itemList
    // =======================================================

    if (
      !Array.isArray(formData.itemList) ||
      formData.itemList.length === 0
    ) {

      alert(
        '비용 항목을 최소 1개 이상 입력해주세요.'
      );

      return;

    }


    // =======================================================
    // 3. 각 Item 검증
    // =======================================================

    for (
      let i = 0;
      i < formData.itemList.length;
      i++
    ) {

      const item =
        formData.itemList[i];


      // itemType

      if (!item.itemType) {

        alert(
          `${i + 1}번째 비용 항목의 유형을 선택해주세요.`
        );

        return;

      }


      // amount

      const itemAmount =
        Number(item.amount);

      if (
        !Number.isFinite(itemAmount) ||
        itemAmount <= 0
      ) {

        alert(
          `${i + 1}번째 비용 항목의 금액을 올바르게 입력해주세요.`
        );

        return;

      }


      // itemDate

      if (!item.itemDate) {

        alert(
          `${i + 1}번째 비용 항목의 사용일을 입력해주세요.`
        );

        return;

      }


      // itemDescription

      if (
        !item.itemDescription ||
        !item.itemDescription.trim()
      ) {

        alert(
          `${i + 1}번째 비용 항목의 내용을 입력해주세요.`
        );

        return;

      }

    }


    // =======================================================
    // 4. requestedAmount
    // =======================================================

    const totalAmount =
      getItemTotal();

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {

      alert(
        '비용 항목의 금액을 입력해주세요.'
      );

      return;

    }


    // =======================================================
    // 5. 첨부파일
    // =======================================================

    if (
      !Array.isArray(formData.files) ||
      formData.files.length === 0
    ) {

      alert(
        '영수증 또는 증빙자료를 최소 1개 첨부해주세요.'
      );

      return;

    }


    // =======================================================
    // 6. 최종 확인
    // =======================================================

    const confirmed =
      window.confirm(

        `비용 정산 신청서를 제출하시겠습니까?\n\n` +

        `워케이션 번호: ${
          formData.workcationNo
        }\n` +

        `신청 금액: ${
          formatMoney(totalAmount)
        }원\n` +

        `비용 항목: ${
          formData.itemList.length
        }개\n` +

        `첨부파일: ${
          formData.files.length
        }개`

      );


    if (!confirmed) {

      return;

    }


    // =======================================================
    // 7. Amount VO 기준 요청 데이터
    //
    // Amount
    // {
    //     workcationNo,
    //     requestedAmount,
    //     amountComment,
    //     itemList,
    //     files
    // }
    //
    // Item
    // {
    //     itemType,
    //     amount,
    //     itemDate,
    //     itemDescription
    // }
    // =======================================================

    const requestData = {

      workcationNo:
        Number(formData.workcationNo),

      requestedAmount:
        totalAmount,

      amountComment:
        formData.amountComment
          ? formData.amountComment.trim()
          : '',

      itemList:
        formData.itemList.map(
          (item) => ({

            itemType:
              item.itemType,

            amount:
              Number(item.amount),

            itemDate:
              item.itemDate,

            itemDescription:
              item.itemDescription.trim()

          })
        ),

      files:
        formData.files

    };


    console.log(
      '================================='
    );

    console.log(
      '📤 비용 신청 요청 데이터'
    );

    console.log(
      'workcationNo:',
      requestData.workcationNo
    );

    console.log(
      'requestedAmount:',
      requestData.requestedAmount
    );

    console.log(
      'amountComment:',
      requestData.amountComment
    );

    console.log(
      'itemList:',
      requestData.itemList
    );

    console.log(
      'files:',
      requestData.files
    );

    console.log(
      '================================='
    );


    // =======================================================
    // 8. 서버 등록
    // =======================================================

    try {

      const createdAmountNo =
        await amountApi.createAmount(
          requestData
        );


      console.log(
        '✅ 생성된 amountNo:',
        createdAmountNo
      );


      alert(
        `비용 신청이 완료되었습니다.\n\n` +
        `신청번호: ${createdAmountNo}`
      );


      // =====================================================
      // 9. 성공 콜백
      // =====================================================

      if (onSuccess) {

        onSuccess(
          createdAmountNo
        );

      }


      // =====================================================
      // 10. 폼 초기화
      // =====================================================

      setFormData({

        workcationNo:
          workcationNo || '',

        requestedAmount: 0,

        amountComment: '',

        itemList: [
          createEmptyItem()
        ],

        files: []

      });


      // =====================================================
      // 11. 파일 input 초기화
      // =====================================================

      const fileInput =
        document.getElementById(
          'amount-file-input'
        );

      if (fileInput) {

        fileInput.value = '';

      }

    } catch (error) {

      console.error(
        '❌ 비용 신청 실패:',
        error
      );

      console.error(
        'HTTP 상태:',
        error.response?.status
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );


      alert(

        error.response?.data?.message ||

        error.response?.data ||

        '비용 신청 중 오류가 발생했습니다.'

      );

    }

  };


  // =========================================================
  // 화면
  // =========================================================

  return (

    <div className="amount-container">


      {/* ===================================================
          제목
      ==================================================== */}

      <h2 className="amount-title">
        비용 정산 신청
      </h2>


      <form
        className="detail-box"
        onSubmit={handleSubmit}
      >


        {/* =================================================
            워케이션 번호
        ================================================== */}

        <div className="info-row">

          <span className="info-label">
            워케이션 번호
          </span>

          <span className="info-value">

            {formData.workcationNo || '-'}

          </span>

        </div>


        {/* =================================================
            총 신청 금액
            Amount.requestedAmount
        ================================================== */}

        <div className="info-row">

          <span className="info-label">
            총 신청 금액
          </span>

          <div className="info-value">

            <strong
              style={{
                fontSize: '20px'
              }}
            >
              {formatMoney(
                requestedAmount
              )}
            </strong>

            <span
              style={{
                marginLeft: '8px'
              }}
            >
              원
            </span>

          </div>

        </div>


        {/* =================================================
            신청 사유
            Amount.amountComment
        ================================================== */}

        <div
          className="info-row"
          style={{
            alignItems: 'flex-start'
          }}
        >

          <span className="info-label">
            신청 사유
          </span>

          <div
            className="info-value"
            style={{
              flex: 1
            }}
          >

            <textarea
              name="amountComment"
              value={
                formData.amountComment
              }
              onChange={
                handleChange
              }
              placeholder="비용 신청 사유를 입력해주세요."
              rows={4}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: '10px'
              }}
            />

          </div>

        </div>


        {/* =================================================
            비용 상세 항목
        ================================================== */}

        <div
          style={{
            marginTop: '25px'
          }}
        >

          <h3>
            비용 상세 항목
          </h3>


          <div
            style={{
              marginBottom: '15px',
              color: '#666',
              fontSize: '13px'
            }}
          >
            ※ 각 비용 항목의 금액 합계가
            총 신청 금액으로 자동 계산됩니다.
          </div>


          {/* =================================================
              itemList
          ================================================== */}

          {formData.itemList.map(
            (item, index) => (

              <div
                key={index}
                style={{
                  padding: '18px',
                  marginBottom: '15px',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              >


                {/* ===========================================
                    항목 헤더
                ============================================ */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}
                >

                  <strong>
                    비용 항목 {index + 1}
                  </strong>


                  {formData.itemList.length > 1 && (

                    <button
                      type="button"
                      className="btn btn-reject"
                      onClick={() =>
                        handleRemoveItem(index)
                      }
                    >
                      삭제
                    </button>

                  )}

                </div>


                {/* ===========================================
                    itemType
                ============================================ */}

                <div
                  style={{
                    marginBottom: '10px'
                  }}
                >

                  <label>
                    항목 구분
                  </label>

                  <select
                    value={
                      item.itemType
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'itemType',
                        e.target.value
                      )
                    }
                    style={{
                      marginLeft: '10px'
                    }}
                  >

                    <option value="S">
                      숙박비 (S)
                    </option>

                    <option value="T">
                      교통비 (T)
                    </option>

                    <option value="E">
                      식비 (E)
                    </option>

                    <option value="F">
                      체험/프로그램 (F)
                    </option>

                    <option value="V">
                      공간대여 (V)
                    </option>

                    <option value="O">
                      기타 (O)
                    </option>

                  </select>

                </div>


                {/* ===========================================
                    amount
                ============================================ */}

                <div
                  style={{
                    marginBottom: '10px'
                  }}
                >

                  <label>
                    금액
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      item.amount
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'amount',
                        e.target.value
                      )
                    }
                    placeholder="금액 입력"
                    style={{
                      marginLeft: '10px'
                    }}
                    required
                  />

                  <span
                    style={{
                      marginLeft: '5px'
                    }}
                  >
                    원
                  </span>

                </div>


                {/* ===========================================
                    itemDate
                ============================================ */}

                <div
                  style={{
                    marginBottom: '10px'
                  }}
                >

                  <label>
                    사용일
                  </label>

                  <input
                    type="date"
                    value={
                      item.itemDate
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'itemDate',
                        e.target.value
                      )
                    }
                    style={{
                      marginLeft: '10px'
                    }}
                    required
                  />

                </div>


                {/* ===========================================
                    itemDescription
                ============================================ */}

                <div>

                  <label>
                    내용 설명
                  </label>

                  <input
                    type="text"
                    value={
                      item.itemDescription
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'itemDescription',
                        e.target.value
                      )
                    }
                    placeholder="사용 내역을 입력해주세요."
                    style={{
                      width: '70%',
                      marginLeft: '10px'
                    }}
                    required
                  />

                </div>

              </div>

            )
          )}


          {/* =================================================
              항목 추가
          ================================================== */}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAddItem}
          >
            + 비용 항목 추가
          </button>

        </div>


        {/* =================================================
            총 신청 금액
        ================================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '20px',
            marginTop: '20px',
            padding: '15px',
            borderTop: '2px solid #333',
            fontWeight: 'bold'
          }}
        >

          <span>
            총 신청 금액
          </span>

          <span
            style={{
              fontSize: '18px'
            }}
          >
            {formatMoney(
              requestedAmount
            )} 원
          </span>

        </div>


        {/* =================================================
            첨부파일
            Amount.files
        ================================================== */}

        <div
          className="info-row"
          style={{
            alignItems: 'flex-start',
            marginTop: '25px'
          }}
        >

          <span className="info-label">
            첨부파일
          </span>

          <div
            className="info-value"
            style={{
              flex: 1
            }}
          >

            <input
              id="amount-file-input"
              type="file"
              multiple
              onChange={
                handleFileChange
              }
              required
            />


            <div
              style={{
                marginTop: '8px',
                fontSize: '13px',
                color: '#666'
              }}
            >
              ※ 영수증 또는 증빙자료를
              최소 1개 첨부해주세요.
            </div>


            {formData.files.length > 0 && (

              <div
                style={{
                  marginTop: '10px'
                }}
              >

                {formData.files.map(
                  (file, index) => (

                    <div
                      key={index}
                      style={{
                        marginBottom: '5px'
                      }}
                    >
                      📎 {file.name}
                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            제출
        ================================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '25px'
          }}
        >

          <button
            type="submit"
            className="btn btn-primary"
          >
            신청서 제출
          </button>

        </div>


      </form>

    </div>

  );

}


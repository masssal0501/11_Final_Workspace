import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountForm({ workcationNo, onSuccess }) {
  const navigate = useNavigate();
  const { amountNo } = useParams();

  // URL에 amountNo가 있으면 수정 모드
  const isEditMode = !!amountNo;

  const [formData, setFormData] = useState({
  amountNo: null,
  workcationNo: workcationNo || 1,
  amountComment: '',
  file: null,
  fileList: [],

  itemList: [
    {
      itemNo: null,
      itemType: 'S',
      amount: '',
      itemDate: null,
      itemApproved: null,
      itemDescription: '',
      amountNo: null,
      sponsorList: []
    }
  ]
});

  const [loading, setLoading] = useState(false);

  // =========================================================
  // 수정 모드 - 기존 데이터 조회
  // =========================================================
  useEffect(() => {
    if (!amountNo) {
      return;
    }

    const fetchAmountDetail = async () => {
      setLoading(true);

      try {
        const data = await amountApi.getAmountById(amountNo);


        if (!data) {
          alert('해당 비용 신청 정보를 찾을 수 없습니다.');
          navigate('/cost/list');
          return;
        }

        // -----------------------------------------------------
        // itemList가 없거나 비어있는 경우
        // -----------------------------------------------------
        const sourceItems = Array.isArray(data.itemList)
          ? data.itemList
          : [];

        // 빈 객체 제거
        const validItems = sourceItems.filter(
          (item) =>
            item &&
            (
              item.itemNo !== null ||
              item.itemType !== null ||
              item.amount !== null ||
              item.itemDescription
            )
        );

       

        // -----------------------------------------------------
        // 기존 Item 데이터 유지
        // -----------------------------------------------------
        const mappedItems =
          validItems.length > 0
            ? validItems.map((item, index) => {
             

                return {
                  itemNo: item.itemNo ?? null,

                  itemType: item.itemType || 'S',

                  // 0도 정상적인 값이므로 그대로 문자열 변환
                  amount:
                    item.amount !== null &&
                    item.amount !== undefined
                      ? String(item.amount)
                      : '',

                  itemDate: item.itemDate ?? null,

                  itemApproved: item.itemApproved ?? null,

                  itemDescription: item.itemDescription || '',

                  amountNo:
                    item.amountNo ??
                    data.amountNo ??
                    null,

                  sponsorList: Array.isArray(item.sponsorList)
                    ? item.sponsorList
                    : []
                };
              })
            : [
                {
                  itemNo: null,
                  itemType: 'S',
                  amount: '',
                  itemDate: null,
                  itemApproved: null,
                  itemDescription: '',
                  amountNo: data.amountNo ?? null,
                  sponsorList: []
                }
              ];

        // -----------------------------------------------------
        // 최종 formData
        // -----------------------------------------------------
        const newFormData = {
        amountNo: data.amountNo ?? Number(amountNo),

        workcationNo:
          data.workcationNo ??
          workcationNo ??
          1,

        amountComment: data.amountComment || '',

        file: null,

        fileList: Array.isArray(data.fileList)
          ? data.fileList
          : [],

        itemList: mappedItems
      };

     

        setFormData(newFormData);

      } catch (error) {
     

        alert('기존 신청 정보를 불러오지 못했습니다.');
        navigate('/cost/list');

      } finally {
        setLoading(false);
      }
    };

    fetchAmountDetail();

  }, [amountNo, navigate, workcationNo]);

  // =========================================================
  // 총 신청 금액
  // =========================================================
  const totalRequestedAmount = formData.itemList.reduce(
    (sum, item) => {
      return sum + (Number(item.amount) || 0);
    },
    0
  );

  // =========================================================
  // 상세 항목 추가
  // =========================================================
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,

      itemList: [
        ...prev.itemList,

        {
          itemNo: null,
          itemType: 'S',
          amount: '',
          itemDate: null,
          itemApproved: null,
          itemDescription: '',
          amountNo: prev.amountNo ?? null,
          sponsorList: []
        }
      ]
    }));
  };

  // =========================================================
  // 상세 항목 삭제
  // =========================================================
  const handleRemoveItem = (index) => {
    if (formData.itemList.length === 1) {
      alert('최소 1개의 비용 항목은 필요합니다.');
      return;
    }

    setFormData((prev) => ({
      ...prev,

      itemList: prev.itemList.filter(
        (_, i) => i !== index
      )
    }));
  };

  // =========================================================
  // 상세 항목 변경
  // =========================================================
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,

      itemList: prev.itemList.map((item, i) => {
        if (i !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value
        };
      })
    }));
  };

  // =========================================================
  // 파일 변경
  // =========================================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      file
    }));
  };

  // =========================================================
  // 제출
  // 등록 / 수정 공통
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

  
    // -----------------------------------------------------
    // 금액 검증
    // -----------------------------------------------------
    if (totalRequestedAmount <= 0) {
      alert('비용 항목별 금액을 올바르게 입력해 주세요.');
      return;
    }

    // -----------------------------------------------------
    // 각 Item 금액 검증
    // -----------------------------------------------------
    const invalidItem = formData.itemList.some(
      (item) =>
        item.amount === '' ||
        item.amount === null ||
        item.amount === undefined ||
        Number(item.amount) <= 0
    );

    if (invalidItem) {
      alert('모든 비용 항목에 금액을 입력해 주세요.');
      return;
    }

    try {
      setLoading(true);

      const formPayload = new FormData();

      // =====================================================
      // Amount
      // =====================================================

      formPayload.append(
        'workcationNo',
        formData.workcationNo
      );

      formPayload.append(
        'requestedAmount',
        totalRequestedAmount
      );

      formPayload.append(
        'amountComment',
        formData.amountComment || ''
      );

      // =====================================================
      // ItemList
      // =====================================================

      formData.itemList.forEach((item, index) => {

        // 수정 시 기존 itemNo 전달
        if (item.itemNo !== null && item.itemNo !== undefined) {
          formPayload.append(
            `itemList[${index}].itemNo`,
            item.itemNo
          );
        }

        formPayload.append(
          `itemList[${index}].itemType`,
          item.itemType
        );

        formPayload.append(
          `itemList[${index}].amount`,
          item.amount
        );

        formPayload.append(
          `itemList[${index}].itemDescription`,
          item.itemDescription || ''
        );

        // 기존 amountNo가 있으면 전달
        if (
          item.amountNo !== null &&
          item.amountNo !== undefined
        ) {
          formPayload.append(
            `itemList[${index}].amountNo`,
            item.amountNo
          );
        }
      });

      // =====================================================
      // 파일
      // =====================================================

      if (formData.file) {
        formPayload.append(
          'file',
          formData.file
        );
      }

      // =====================================================
      // FormData 확인
      // =====================================================

   
      for (const [key, value] of formPayload.entries()) {

      }



      // =====================================================
      // 등록 / 수정
      // =====================================================

      if (isEditMode) {

      

        await amountApi.updateAmount(
          formData.amountNo,
          formPayload
        );

        alert('비용 신청이 수정되었습니다.');

      } else {



        await amountApi.createAmount(
          formPayload
        );

        alert('비용 신청이 완료되었습니다.');
      }

      // =====================================================
      // 완료
      // =====================================================

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/cost/list');
      }

    } catch (error) {

  

      alert('처리 중 오류가 발생했습니다.');

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Loading
  // =========================================================
  if (loading) {
    return (
      <div className="amount-form-container">
        기존 데이터를 불러오는 중입니다...
      </div>
    );
  }

  // =========================================================
  // 화면
  // =========================================================
  return (
    <div className="amount-form-container">

      <h2>
        {isEditMode
          ? '비용 정산 수정'
          : '비용 정산 신청'}
      </h2>

      <form onSubmit={handleSubmit}>

        {/* 총 신청 금액 */}
        <div className="form-group total-amount-box">

          <label>
            총 신청 금액 (자동 합산):
          </label>

          <span className="total-amount-value">
            {totalRequestedAmount.toLocaleString()} 원
          </span>

        </div>

        {/* 파일 */}
        <div className="form-group">

  <label>
    증빙 영수증 파일:
  </label>

  {/* 기존 첨부파일 */}
  {formData.fileList.length > 0 && (
    <div className="existing-file-list">

      <div className="existing-file-title">
        기존 첨부파일
      </div>

      {formData.fileList
        .filter(file => file && file.status !== 'N')
        .map((file) => (
          <div
            key={file.amountattachmentNo}
            className="existing-file-item"
          >
            📎 {file.originName}

            {file.filePath && (
              <a
                href={file.filePath}
                target="_blank"
                rel="noopener noreferrer"
              >
                보기
              </a>
            )}
          </div>
        ))}

    </div>
  )}

  {/* 새 파일 선택 */}
  <input
    type="file"
    onChange={handleFileChange}
  />

  {formData.file && (
    <div className="new-file-name">
      새 파일: {formData.file.name}
    </div>
  )}

</div>

        {/* 신청 사유 */}
        <div className="form-group">

          <label>
            신청 사유 / 메모:
          </label>

          <textarea
            value={formData.amountComment}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amountComment: e.target.value
              }))
            }
            placeholder="정산 신청 사유를 입력하세요."
            rows="3"
          />

        </div>

        <hr className="form-divider" />

        {/* 상세 항목 */}
        <div className="section-header">

          <h3>
            비용 상세 항목 List
          </h3>

          <button
            type="button"
            className="btn-add-item"
            onClick={handleAddItem}
          >
            + 항목 추가
          </button>

        </div>

        {formData.itemList.map((item, index) => (

          <div
            key={item.itemNo ?? `new-${index}`}
            className="item-card"
          >

            <div className="item-row">

              {/* 항목 구분 */}
              <div className="form-group">

                <label>
                  항목 구분:
                </label>

                <select
                  value={item.itemType}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      'itemType',
                      e.target.value
                    )
                  }
                >

                  <option value="S">
                    숙박 (S)
                  </option>

                  <option value="T">
                    교통 (T)
                  </option>

                  <option value="E">
                    식비 (E)
                  </option>

                  <option value="F">
                    체험 (F)
                  </option>

                  <option value="V">
                    공간대여/차량 (V)
                  </option>

                  <option value="O">
                    기타 (O)
                  </option>

                </select>

              </div>

              {/* 금액 */}
              <div className="form-group">

                <label>
                  금액:
                </label>

                <input
                  type="number"
                  min="1"
                  value={item.amount ?? ''}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      'amount',
                      e.target.value
                    )
                  }
                  placeholder="금액 입력"
                  required
                />

                원

              </div>

              {/* 삭제 */}
              {formData.itemList.length > 1 && (

                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() =>
                    handleRemoveItem(index)
                  }
                >
                  삭제
                </button>

              )}

            </div>

            {/* 설명 */}
            <div
              className="form-group"
              style={{ marginTop: '10px' }}
            >

              <label>
                내용 설명:
              </label>

              {item.itemType === 'O' ? (

                <textarea
                  value={item.itemDescription ?? ''}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      'itemDescription',
                      e.target.value
                    )
                  }
                  placeholder="기타 상세 내용을 입력하세요."
                  rows="2"
                />

              ) : (

                <input
                  type="text"
                  value={item.itemDescription ?? ''}
                  onChange={(e) =>
                    handleItemChange(
                      index,
                      'itemDescription',
                      e.target.value
                    )
                  }
                  placeholder="상세 내용을 입력하세요 (예: 호텔 2박 숙박비)"
                />

              )}

            </div>

          </div>

        ))}

        {/* 제출 */}
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {isEditMode
            ? '수정하기'
            : '신청서 제출'}
        </button>

      </form>

    </div>
  );
}
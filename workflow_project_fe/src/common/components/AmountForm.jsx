import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountForm({ workcationNo, onSuccess }) {

  const navigate = useNavigate();
  const { amountNo } = useParams();

  // URL에 amountNo가 있으면 수정
  const isEditMode = !!amountNo;

  const [formData, setFormData] = useState({
    amountNo: null,

    // amount.workcation_no
    workcationNo: workcationNo ?? null,

    // amount.amount_comment
    amountComment: '',

    // 신규 파일
    files: [],

    // 기존 amount_file
    fileList: [],

    // amount_item
    itemList: [
      {
        itemNo: null,
        amountNo: null,

        // amount_item.item_type
        itemType: 'S',

        // amount_item.cost
        cost: '',

        // amount_item.item_date
        itemDate: null,

        // amount_item.item_approved
        itemApproved: null,

        // amount_item.item_description
        itemDescription: ''
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

        const data =
          await amountApi.getAmountById(amountNo);

        console.log(
          '📌 기존 비용 상세:',
          data
        );

        console.log(
          '📌 기존 amount_item:',
          data?.itemList
        );

        console.log(
          '📌 기존 amount_file:',
          data?.fileList
        );


        if (!data) {

          alert(
            '해당 비용 신청 정보를 찾을 수 없습니다.'
          );

          navigate('/cost/list');

          return;
        }


        // =====================================================
        // amount_item
        //
        // 중요:
        // sponsorList 제거
        // amount_list는 amount_item의 자식이 아님
        // =====================================================

        const sourceItems =
          Array.isArray(data.itemList)
            ? data.itemList
            : [];


        const mappedItems =
          sourceItems.length > 0

            ? sourceItems.map((item) => ({

                itemNo:
                  item.itemNo ??
                  null,

                amountNo:
                  item.amountNo ??
                  data.amountNo ??
                  null,

                itemType:
                  item.itemType ||
                  'S',

                cost:
                  item.cost !== null &&
                  item.cost !== undefined
                    ? String(item.cost)
                    : '',

                itemDate:
                  item.itemDate ??
                  null,

                itemApproved:
                  item.itemApproved ??
                  null,

                itemDescription:
                  item.itemDescription ||
                  ''
              }))

            : [
                {
                  itemNo: null,

                  amountNo:
                    data.amountNo ??
                    Number(amountNo),

                  itemType: 'S',

                  cost: '',

                  itemDate: null,

                  itemApproved: null,

                  itemDescription: ''
                }
              ];


        // =====================================================
        // amount
        // =====================================================

        const newFormData = {

          amountNo:
            data.amountNo ??
            Number(amountNo),

          workcationNo:
            data.workcationNo ??
            workcationNo ??
            null,

          amountComment:
            data.amountComment ||
            '',

          // 신규 파일은 항상 빈 배열
          files: [],

          // amount_file
          fileList:
            Array.isArray(data.fileList)
              ? data.fileList
              : [],

          // amount_item
          itemList:
            mappedItems
        };


        setFormData(newFormData);

      } catch (error) {

        console.error(
          '기존 신청 정보 조회 실패:',
          error
        );

        console.error(
          '서버 응답:',
          error.response?.data
        );

        alert(
          '기존 신청 정보를 불러오지 못했습니다.'
        );

        navigate('/cost/list');

      } finally {

        setLoading(false);

      }

    };


    fetchAmountDetail();

  }, [
    amountNo,
    navigate,
    workcationNo
  ]);


  // =========================================================
  // 총 신청 금액
  //
  // amount.requested_amount
  // ← amount_item.cost 합계
  // =========================================================

  const totalRequestedAmount =
    formData.itemList.reduce(
      (sum, item) =>
        sum +
        (Number(item.cost) || 0),
      0
    );


  // =========================================================
  // 항목 추가
  // =========================================================

  const handleAddItem = () => {

    setFormData((prev) => ({

      ...prev,

      itemList: [

        ...prev.itemList,

        {
          itemNo: null,

          amountNo:
            prev.amountNo ??
            null,

          itemType: 'S',

          cost: '',

          itemDate: null,

          itemApproved: null,

          itemDescription: ''
        }

      ]

    }));

  };


  // =========================================================
  // 항목 삭제
  // =========================================================

  const handleRemoveItem = (index) => {

    if (
      formData.itemList.length === 1
    ) {

      alert(
        '최소 1개의 비용 항목은 필요합니다.'
      );

      return;
    }


    setFormData((prev) => ({

      ...prev,

      itemList:
        prev.itemList.filter(
          (_, i) =>
            i !== index
        )

    }));

  };


  // =========================================================
  // 항목 변경
  // =========================================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {

    setFormData((prev) => ({

      ...prev,

      itemList:
        prev.itemList.map(
          (item, i) => {

            if (i !== index) {
              return item;
            }

            return {
              ...item,
              [field]: value
            };

          }
        )

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

    if (
      selectedFiles.length === 0
    ) {
      return;
    }


    setFormData((prev) => ({

      ...prev,

      files: [
        ...prev.files,
        ...selectedFiles
      ]

    }));


    // 같은 파일 다시 선택 가능
    e.target.value = '';

  };


  // =========================================================
  // 신규 파일 삭제
  // =========================================================

  const handleRemoveNewFile = (
    index
  ) => {

    setFormData((prev) => ({

      ...prev,

      files:
        prev.files.filter(
          (_, i) =>
            i !== index
        )

    }));

  };


  // =========================================================
  // 기존 파일 삭제 표시
  //
  // 실제 DB 삭제는 서버에서 처리
  // =========================================================

  const handleRemoveExistingFile = (
    index
  ) => {

    setFormData((prev) => ({

      ...prev,

      fileList:
        prev.fileList.map(
          (file, i) => {

            if (i !== index) {
              return file;
            }

            return {
              ...file,
              status: 'N'
            };

          }
        )

    }));

  };


  // =========================================================
  // 제출
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // =====================================================
    // workcation_no 검증
    // =====================================================

    if (
      formData.workcationNo === null ||
      formData.workcationNo === undefined ||
      formData.workcationNo === ''
    ) {

      alert(
        '워크케이션 정보가 없습니다.'
      );

      return;
    }


    // =====================================================
    // 기존 파일
    // =====================================================

    const activeExistingFiles =
      formData.fileList.filter(
        (file) =>
          file &&
          file.status !== 'N'
      );


    const hasExistingFile =
      activeExistingFiles.length > 0;


    const hasNewFile =
      formData.files.length > 0;


    // =====================================================
    // 신규 등록 파일
    // =====================================================

    if (
      !isEditMode &&
      !hasNewFile
    ) {

      alert(
        '증빙 영수증 파일을 최소 1개 이상 첨부해주세요.'
      );

      return;
    }


    // =====================================================
    // 수정 파일
    // =====================================================

    if (
      isEditMode &&
      !hasExistingFile &&
      !hasNewFile
    ) {

      alert(
        '증빙 영수증 파일을 최소 1개 이상 첨부해주세요.'
      );

      return;
    }


    // =====================================================
    // 비용 항목 존재 확인
    // =====================================================

    if (
      formData.itemList.length === 0
    ) {

      alert(
        '최소 1개의 비용 항목이 필요합니다.'
      );

      return;
    }


    // =====================================================
    // 금액 검사
    // =====================================================

    if (
      totalRequestedAmount <= 0
    ) {

      alert(
        '비용 항목별 금액을 올바르게 입력해 주세요.'
      );

      return;
    }


    // =====================================================
    // 개별 금액 검사
    // =====================================================

    const invalidItem =
      formData.itemList.some(
        (item) => {

          const cost =
            Number(item.cost);

          return (
            item.cost === '' ||
            item.cost === null ||
            item.cost === undefined ||
            Number.isNaN(cost) ||
            cost <= 0
          );

        }
      );


    if (invalidItem) {

      alert(
        '모든 비용 항목에 금액을 입력해 주세요.'
      );

      return;
    }


    try {

      setLoading(true);


      // ===================================================
      // FormData
      // ===================================================

      const formPayload =
        new FormData();


      // ===================================================
      // amount
      // ===================================================

      formPayload.append(
        'workcationNo',
        String(
          formData.workcationNo
        )
      );


      formPayload.append(
        'requestedAmount',
        String(
          totalRequestedAmount
        )
      );


      formPayload.append(
        'amountComment',
        formData.amountComment || ''
      );


      // ===================================================
      // amount_item
      //
      // DB:
      //
      // amount_item
      // ├─ item_no
      // ├─ amount_no
      // ├─ cost
      // ├─ item_type
      // ├─ item_date
      // ├─ item_approved
      // └─ item_description
      //
      // sponsorList는 여기 넣지 않는다.
      // ===================================================

      formData.itemList.forEach(
        (item, index) => {

          // 기존 item_no
          if (
            item.itemNo !== null &&
            item.itemNo !== undefined
          ) {

            formPayload.append(
              `itemList[${index}].itemNo`,
              String(item.itemNo)
            );

          }


          // amount_no
          if (
            item.amountNo !== null &&
            item.amountNo !== undefined
          ) {

            formPayload.append(
              `itemList[${index}].amountNo`,
              String(item.amountNo)
            );

          }


          // item_type
          formPayload.append(
            `itemList[${index}].itemType`,
            item.itemType
          );


          // cost
          formPayload.append(
            `itemList[${index}].cost`,
            String(item.cost)
          );


          // item_description
          formPayload.append(
            `itemList[${index}].itemDescription`,
            item.itemDescription || ''
          );


          // item_date
          //
          // 사용하지 않는 경우 전송하지 않아도 됨.
          // 현재 신청 화면에서는 DB 기본값/서버 처리에 맡김.

        }
      );


      // ===================================================
      // 신규 파일
      //
      // amount_file과 연결
      // ===================================================

      formData.files.forEach(
        (file) => {

          formPayload.append(
            'file',
            file
          );

        }
      );


      // ===================================================
      // 기존 파일 삭제 정보
      //
      // 수정 시 status = N으로 표시된 파일 전달
      // ===================================================

      if (isEditMode) {

        formData.fileList
          .filter(
            (file) =>
              file &&
              file.status === 'N'
          )
          .forEach(
            (file, index) => {

              if (
                file.amountattachmentNo !==
                null &&
                file.amountattachmentNo !==
                undefined
              ) {

                formPayload.append(
                  `deleteFileList[${index}]`,
                  String(
                    file.amountattachmentNo
                  )
                );

              }

            }
          );

      }


      // ===================================================
      // FormData 확인
      // ===================================================

      console.log(
        '========== FormData =========='
      );

      for (
        const [key, value]
        of formPayload.entries()
      ) {

        if (
          value instanceof File
        ) {

          console.log(
            key,
            {
              name: value.name,
              size: value.size,
              type: value.type
            }
          );

        } else {

          console.log(
            key,
            value
          );

        }

      }


      // ===================================================
      // 등록 / 수정
      // ===================================================

      if (isEditMode) {

        await amountApi.updateAmount(
          formData.amountNo,
          formPayload
        );

        alert(
          '비용 신청이 수정되었습니다.'
        );

      } else {

        await amountApi.createAmount(
          formPayload
        );

        alert(
          '비용 신청이 완료되었습니다.'
        );

      }


      // ===================================================
      // 완료
      // ===================================================

      if (onSuccess) {

        onSuccess();

      } else {

        navigate('/cost/list');

      }


    } catch (error) {

      console.error(
        '비용 신청 처리 실패:',
        error
      );

      console.error(
        '서버 응답:',
        error.response?.data
      );


      alert(
        error.response?.data ||
        '처리 중 오류가 발생했습니다.'
      );

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
        데이터를 불러오는 중입니다...
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


        {/* =================================================
            총 신청 금액
        ================================================= */}

        <div className="form-group total-amount-box">

          <label>
            총 신청 금액 (자동 합산):
          </label>

          <span className="total-amount-value">

            {totalRequestedAmount.toLocaleString()}
            {' '}원

          </span>

        </div>


        {/* =================================================
            첨부파일
        ================================================= */}

        <div className="form-group">

          <label>

            증빙 영수증 파일:

            <span
              style={{
                color: 'red',
                marginLeft: '5px'
              }}
            >
              * 필수
            </span>

          </label>


          {/* 기존 파일 */}

          {formData.fileList
            .filter(
              (file) =>
                file &&
                file.status !== 'N'
            )
            .length > 0 && (

            <div className="existing-file-list">

              <div className="existing-file-title">
                기존 첨부파일
              </div>


              {formData.fileList
                .filter(
                  (file) =>
                    file &&
                    file.status !== 'N'
                )
                .map(
                  (file, index) => (

                    <div
                      key={
                        file.amountattachmentNo ??
                        index
                      }
                      className="existing-file-item"
                    >

                      <span>
                        📎 {file.originName}
                      </span>


                      {file.filePath && (

                        <a
                          href={file.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginLeft: '10px'
                          }}
                        >
                          보기
                        </a>

                      )}


                      <button
                        type="button"
                        onClick={() => {

                          const originalIndex =
                            formData.fileList.findIndex(
                              (f) =>
                                f.amountattachmentNo ===
                                file.amountattachmentNo
                            );

                          handleRemoveExistingFile(
                            originalIndex
                          );

                        }}
                        style={{
                          marginLeft: '10px',
                          color: '#dc3545',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        삭제
                      </button>

                    </div>

                  )
                )}

            </div>

          )}


          {/* 신규 파일 */}

          <input
            type="file"
            multiple
            onChange={handleFileChange}
          />


          {formData.files.length > 0 && (

            <div
              className="new-file-list"
              style={{
                marginTop: '10px'
              }}
            >

              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: '5px'
                }}
              >
                새로 첨부할 파일
              </div>


              {formData.files.map(
                (file, index) => (

                  <div
                    key={`${file.name}-${index}`}
                    className="new-file-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',
                      padding: '5px 0'
                    }}
                  >

                    <span>
                      📎 {file.name}
                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveNewFile(index)
                      }
                      style={{
                        marginLeft: '10px',
                        color: '#dc3545',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      삭제
                    </button>

                  </div>

                )
              )}

            </div>

          )}


          {/* 파일 없음 */}

          {formData.files.length === 0 &&
            formData.fileList.filter(
              (file) =>
                file &&
                file.status !== 'N'
            ).length === 0 && (

              <div
                style={{
                  color: '#dc3545',
                  marginTop: '5px'
                }}
              >
                ⚠ 증빙 영수증 파일을
                최소 1개 이상 첨부해주세요.
              </div>

            )}

        </div>


        {/* =================================================
            신청 사유
        ================================================= */}

        <div className="form-group">

          <label>
            신청 사유 / 메모:
          </label>


          <textarea
            value={
              formData.amountComment
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amountComment:
                  e.target.value
              }))
            }
            placeholder="정산 신청 사유를 입력하세요."
            rows="3"
          />

        </div>


        <hr className="form-divider" />


        {/* =================================================
            비용 상세 항목
        ================================================= */}

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


        {formData.itemList.map(
          (item, index) => (

            <div
              key={
                item.itemNo ??
                `new-${index}`
              }
              className="item-card"
            >

              <div className="item-row">


                {/* 항목 구분 */}

                <div className="form-group">

                  <label>
                    항목 구분:
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
                      공간대여 (V)
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
                    step="0.01"
                    value={
                      item.cost ?? ''
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'cost',
                        e.target.value
                      )
                    }
                    placeholder="금액 입력"
                    required
                  />

                  {' '}원

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
                style={{
                  marginTop: '10px'
                }}
              >

                <label>
                  내용 설명:
                </label>


                {item.itemType === 'O' ? (

                  <textarea
                    value={
                      item.itemDescription ?? ''
                    }
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
                    value={
                      item.itemDescription ?? ''
                    }
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        'itemDescription',
                        e.target.value
                      )
                    }
                    placeholder="상세 내용을 입력하세요"
                  />

                )}

              </div>

            </div>

          )
        )}


        {/* =================================================
            제출
        ================================================= */}

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
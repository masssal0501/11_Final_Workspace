import React, { useState } from 'react';
import { amountApi } from '../api/amountApi';

export default function AmountForm({ workcationNo, onSuccess }) {
  const [formData, setFormData] = useState({
    workcationNo: workcationNo || 1,
    requestedAmount: 0,
    amountComment: '',
    itemList: [
      {
        itemType: 'S', // S: 숙박, T: 교통, E: 식비, F: 체험, V: 공간, O: 기타
        itemDescription: '',
        sponsorList: [
          { sponsorName: '지자체 지원금', amount: 0, remark: '' }
        ]
      }
    ]
  });

  // 상세 항목(Item) 추가
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      itemList: [
        ...prev.itemList,
        {
          itemType: 'E',
          itemDescription: '',
          sponsorList: []
        }
      ]
    }));
  };

  // 상세 항목 입력값 변경
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.itemList];
    updatedItems[index][field] = value;
    setFormData({ ...formData, itemList: updatedItems });
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdAmountNo = await amountApi.createAmount(formData);
      alert(`비용 신청이 완료되었습니다. (신청번호: ${createdAmountNo})`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('비용 신청 실패:', error);
      alert('비용 신청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>비용 정산 신청</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>총 신청 금액: </label>
          <input
            type="number"
            value={formData.requestedAmount}
            onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>신청 사유 / 메모: </label>
          <textarea
            value={formData.amountComment}
            onChange={(e) => setFormData({ ...formData, amountComment: e.target.value })}
          />
        </div>

        <hr style={{ margin: '20px 0' }} />
        <h3>비용 상세 항목 List</h3>

        {formData.itemList.map((item, index) => (
          <div key={index} style={{ background: '#f9f9f9', padding: '10px', marginBottom: '10px' }}>
            <div>
              <label>항목 구분: </label>
              <select
                value={item.itemType}
                onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
              >
                <option value="S">숙박비 (S)</option>
                <option value="T">교통비 (T)</option>
                <option value="E">식비 (E)</option>
                <option value="F">체험/프로그램 (F)</option>
                <option value="V">공간대여 (V)</option>
                <option value="O">기타 (O)</option>
              </select>
            </div>
            <div style={{ marginTop: '5px' }}>
              <label>내용 설명: </label>
              <input
                type="text"
                value={item.itemDescription}
                onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddItem}>+ 항목 추가</button>
        <br /><br />
        <button type="submit" style={{ backgroundColor: '#007bff', color: '#fff', padding: '10px 20px' }}>
          신청서 제출
        </button>
      </form>
    </div>
  );
}
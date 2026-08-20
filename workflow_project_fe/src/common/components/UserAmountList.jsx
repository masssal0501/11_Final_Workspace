import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function UserAmountList({ workcationNo }) {
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState([]);

  const fetchAmountList = async () => {
    try {
      const data = await amountApi.getAmountListByWorkcation(workcationNo || 1);
      setAmounts(data);
    } catch (error) {
      console.error('목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchAmountList();
  }, [workcationNo]);

  // 📌 수정 버튼 클릭 시 작성 페이지로 이동하며 기존 데이터 전달
  const handleEdit = (item) => {
    if (['A', 'J', 'C'].includes(item.status)) {
      alert('승인, 반려 또는 취소된 내역은 수정할 수 없습니다.');
      return;
    }

    // state 객체로 선택된 항목 데이터를 넘김
    navigate('/cost/apply', { state: { editData: item } });
  };

  const handleCancel = async (amountNo) => {
    if (!window.confirm(`[신청번호 ${amountNo}] 정산 신청을 취소하시겠습니까?`)) {
      return;
    }

    try {
      await amountApi.cancelAmount(amountNo);
      alert('신청이 취소되었습니다.');
      fetchAmountList();
    } catch (error) {
      console.error('취소 실패:', error);
      alert(error.response?.data || '취소 처리에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      R: '검토중',
      A: '승인됨',
      J: '반려됨',
      H: '보류됨',
      C: '취소됨'
    };
    return (
      <span className={`status-badge status-${status}`}>
        {statusMap[status] || status}
      </span>
    );
  };

  return (
    <div className="amount-container">
      <div className="amount-header">
        <h2 className="amount-title">내 비용 정산 신청 내역 (사원용)</h2>
        <button className="btn btn-primary" onClick={() => navigate('/cost/apply')}>
          + 비용 신청하기
        </button>
      </div>

      <table className="amount-table">
        <thead>
          <tr className="user-table-header">
            <th className="text-center">신청번호</th>
            <th className="text-right">신청 금액</th>
            <th className="text-right">승인 금액</th>
            <th className="text-center">상태</th>
            <th className="text-center">신청일</th>
            <th className="text-center">신청 관리</th>
          </tr>
        </thead>
        <tbody>
          {amounts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">신청 내역이 없습니다.</td>
            </tr>
          ) : (
            amounts.map((item) => (
              <tr key={item.amountNo}>
                <td className="text-center">{item.amountNo}</td>
                <td className="text-right">{item.requestedAmount?.toLocaleString()} 원</td>
                <td className="text-right">
                  {item.approvedAmount ? `${item.approvedAmount.toLocaleString()} 원` : '-'}
                </td>
                <td className="text-center">{getStatusBadge(item.status)}</td>
                <td className="text-center">{item.requestedAt}</td>
                <td className="text-center">
                  {['R', 'H'].includes(item.status) ? (
                    <>
                      <button className="btn btn-edit" onClick={() => handleEdit(item)}>수정</button>
                      <button className="btn btn-cancel" onClick={() => handleCancel(item.amountNo)}>취소</button>
                    </>
                  ) : (
                    <span className="text-disabled">변경 불가</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
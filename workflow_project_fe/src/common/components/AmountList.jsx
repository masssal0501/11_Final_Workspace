import React, { useEffect, useState } from 'react';
import { amountApi } from '../api/amountApi';

export default function AmountList({ workcationNo }) {
  const [amounts, setAmounts] = useState([]);

  // 목록 조회
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

  // 결재 처리 핸들러 (승인/반려/보류)
  const handleApproval = async (item, status) => {
    const comment = prompt('결재 의견을 입력하세요:');
    if (comment === null) return;

    let approvedAmount = null;

    if (status === 'A') {
      const inputAmt = prompt('승인 금액을 입력하세요:', item.requestedAmount);
      if (inputAmt === null) return;

      approvedAmount = Number(inputAmt);

      if (isNaN(approvedAmount) || approvedAmount < 0) {
        alert('올바른 금액을 입력해 주세요.');
        return;
      }

      if (approvedAmount > item.requestedAmount) {
        alert(
          `승인 금액(${approvedAmount.toLocaleString()}원)은 신청 금액(${item.requestedAmount.toLocaleString()}원)을 초과할 수 없습니다.`
        );
        return;
      }
    }

    try {
      await amountApi.updateApproval(item.amountNo, status, approvedAmount, comment);
      alert('결재 상태가 변경되었습니다.');
      fetchAmountList();
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert(error.response?.data || '결재 처리에 실패했습니다.');
    }
  };

  // 📌 신청 내용 수정
  const handleEdit = async (item) => {
    if (['A', 'J', 'C'].includes(item.status)) {
      alert('승인, 반려 또는 취소된 내역은 수정할 수 없습니다.');
      return;
    }

    const newRequestedAmount = prompt('변경할 신청 금액을 입력하세요:', item.requestedAmount);
    if (newRequestedAmount === null) return;

    const newComment = prompt('변경할 신청 사유/의견을 입력하세요:', item.amountComment || '');
    if (newComment === null) return;

    const amt = Number(newRequestedAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('올바른 금액을 입력해 주세요.');
      return;
    }

    try {
      await amountApi.updateAmount(item.amountNo, {
        requestedAmount: amt,
        amountComment: newComment,
        status: item.status
      });
      alert('신청내역이 수정되었습니다.');
      fetchAmountList();
    } catch (error) {
      console.error('수정 실패:', error);
      alert(error.response?.data || '수정에 실패했습니다.');
    }
  };

  // 📌 신청 취소
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

  const getStatusText = (status) => {
    switch (status) {
      case 'R': return '검토중(R)';
      case 'A': return '승인됨(A)';
      case 'J': return '반려됨(J)';
      case 'H': return '보류됨(H)';
      case 'C': return '취소됨(C)';
      default: return status;
    }
  };

  return (
    <div>
      <h2>워케이션 비용 정산 신청 내역</h2>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>신청번호</th>
            <th>신청 금액</th>
            <th>승인 금액</th>
            <th>상태</th>
            <th>신청일</th>
            <th>결재 처리</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {amounts.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>신청 내역이 없습니다.</td></tr>
          ) : (
            amounts.map((item) => (
              <tr key={item.amountNo}>
                <td>{item.amountNo}</td>
                <td>{item.requestedAmount?.toLocaleString()} 원</td>
                <td>{item.approvedAmount ? `${item.approvedAmount.toLocaleString()} 원` : '-'}</td>
                <td><strong>{getStatusText(item.status)}</strong></td>
                <td>{item.requestedAt}</td>
                <td>
                  {/* 검토중(R) 또는 보류(H) 상태일 때 결재 기능 활성화 */}
                  {['R', 'H'].includes(item.status) && (
                    <>
                      <button onClick={() => handleApproval(item, 'A')}>승인</button>{' '}
                      <button onClick={() => handleApproval(item, 'J')}>반려</button>{' '}
                      {item.status === 'R' && (
                        <button onClick={() => handleApproval(item, 'H')}>보류</button>
                      )}
                    </>
                  )}
                </td>
                <td>
                  {/* 검토중(R) 또는 보류(H) 상태일 때만 수정/취소 가능 */}
                  {['R', 'H'].includes(item.status) && (
                    <>
                      <button onClick={() => handleEdit(item)}>수정</button>{' '}
                      <button onClick={() => handleCancel(item.amountNo)}>취소</button>
                    </>
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
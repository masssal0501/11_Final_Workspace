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

  // 결재 처리 핸들러
  const handleApproval = async (amountNo, status) => {
    const comment = prompt('결재 의견을 입력하세요:');
    let approvedAmount = null;

    if (status === 'A') {
      const inputAmt = prompt('승인 금액을 입력하세요:');
      approvedAmount = inputAmt ? Number(inputAmt) : null;
    }

    try {
      await amountApi.updateApproval(amountNo, status, approvedAmount, comment);
      alert('결재 상태가 변경되었습니다.');
      fetchAmountList(); // 목록 새로고침
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert('결재 처리에 실패했습니다.');
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
          </tr>
        </thead>
        <tbody>
          {amounts.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>신청 내역이 없습니다.</td></tr>
          ) : (
            amounts.map((item) => (
              <tr key={item.amountNo}>
                <td>{item.amountNo}</td>
                <td>{item.requestedAmount?.toLocaleString()} 원</td>
                <td>{item.approvedAmount ? `${item.approvedAmount.toLocaleString()} 원` : '-'}</td>
                <td><strong>{getStatusText(item.status)}</strong></td>
                <td>{item.requestedAt}</td>
                <td>
                  {item.status === 'R' && (
                    <>
                      <button onClick={() => handleApproval(item.amountNo, 'A')}>승인</button>{' '}
                      <button onClick={() => handleApproval(item.amountNo, 'J')}>반려</button>{' '}
                      <button onClick={() => handleApproval(item.amountNo, 'H')}>보류</button>
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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AdminAmount({ workcationNo }) {
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

  const handleApproval = async (e, item, status) => {
    e.stopPropagation();

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
      alert('결재 처리가 완료되었습니다.');
      fetchAmountList();
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert(error.response?.data || '결재 처리에 실패했습니다.');
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
      {/* 📌 상단 헤더 및 통계 페이지 이동 버튼 추가 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="amount-title admin" style={{ margin: 0 }}>비용 정산 결재 관리 (관리자)</h2>
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={() => navigate('/admin/statistics')}
          style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          📊 정산 통계 보기
        </button>
      </div>

      <table className="amount-table">
        <thead>
          <tr className="admin-table-header">
            <th className="text-center">신청번호</th>
            <th className="text-right">신청 금액</th>
            <th className="text-right">승인 금액</th>
            <th className="text-center">상태</th>
            <th className="text-center">신청일</th>
            <th className="text-center">결재 처리</th>
          </tr>
        </thead>
        <tbody>
          {amounts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">정산 신청 내역이 없습니다.</td>
            </tr>
          ) : (
            amounts.map((item) => (
              <tr 
                key={item.amountNo} 
                onClick={() => navigate(`/cost/detail/${item.amountNo}`)}
                style={{ cursor: 'pointer' }}
              >
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
                      <button className="btn btn-approve" onClick={(e) => handleApproval(e, item, 'A')}>승인</button>
                      <button className="btn btn-reject" onClick={(e) => handleApproval(e, item, 'J')}>반려</button>
                      {item.status === 'R' && (
                        <button className="btn btn-hold" onClick={(e) => handleApproval(e, item, 'H')}>보류</button>
                      )}
                    </>
                  ) : (
                    <span className="text-disabled">
                      {item.status === 'C' ? '신청자 취소건' : '처리 완료'}
                    </span>
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
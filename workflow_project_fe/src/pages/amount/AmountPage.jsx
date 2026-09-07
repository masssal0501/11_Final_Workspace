import React from 'react';
import UserAmountList from '../../Amount/components/UserAmountList';

export default function AmountPage({ workcationNo }) {
  return (
    <div style={{ padding: '20px' }}>
      {/* 사원 전용: 내 비용 정산 신청 내역 (조회/수정/취소) */}
      <UserAmountList workcationNo={workcationNo} />
    </div>
  );
}
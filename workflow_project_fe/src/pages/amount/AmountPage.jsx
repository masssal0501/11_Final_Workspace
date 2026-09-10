import React from 'react';
import UserAmountList from '../../amount/components/UserAmountList';

export default function AmountPage({ workcationNo }) {
  return (
    // 사원 전용: 내 비용 정산 신청 내역 (조회/수정/취소)
    // UserAmountList 내부에서 자체 page-container 구조(<main className="amount-container">)를 갖는다.
    <UserAmountList workcationNo={workcationNo} />
  );
}
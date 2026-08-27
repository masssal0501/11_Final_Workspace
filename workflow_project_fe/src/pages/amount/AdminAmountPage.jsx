import React from 'react';
import AdminAmount from '../../amount/components/AdminAmount';
import { useNavigate } from 'react-router-dom';

export default function AdminAmountPage({ workcationNo }) {
    const navigate = useNavigate();

  return (

    
    <div style={{ padding: '20px' }}>
      {/* 관리자 결재 목록 컴포넌트 */}
      <AdminAmount workcationNo={workcationNo} />
    </div>
  );
}
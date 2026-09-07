import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AmountForm from './AmountForm';
import AmountList from './AmountList';

function AmountPage() {
  const navigate = useNavigate();
  const [editTarget, setEditTarget] = useState(null); // 수정할 데이터 상태

  // "새 항목 등록" 버튼 클릭 시 (수정 데이터 초기화 후 폼 이동)
  const handleGoToAdd = () => {
    setEditTarget(null);
    navigate('/cost/add');
  };

  // 목록에서 [수정] 버튼 클릭 시 (수정 데이터 세팅 후 폼 이동)
  const handleEditSelect = (item) => {
    setEditTarget(item);
    navigate('/cost/add');
  };

  // 폼 제출(등록/수정) 성공 시 처리
  const handleFormSuccess = () => {
    setEditTarget(null);
    navigate('/cost/list'); // 목록 화면으로 복귀
  };

  // 수정 취소 시 처리
  const handleCancelEdit = () => {
    setEditTarget(null);
    navigate('/cost/list'); // 목록 화면으로 복귀
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>워케이션 비용 관리</h2>
      
      {/* Upper Navigation Buttons */}
      <div style={{ marginBottom: '20px', gap: '10px', display: 'flex' }}>
        <button 
          onClick={() => { setEditTarget(null); navigate('/cost/list'); }}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          목록 보기
        </button>
        <button 
          onClick={handleGoToAdd}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + 새 항목 신청
        </button>
      </div>

      {/* Sub Router */}
      <Routes>
        {/* /cost/list 경로: 내역 목록 */}
        <Route 
          path="list" 
          element={
            <AmountList 
              workcationNo={1} 
              onEditSelect={handleEditSelect} 
            />
          } 
        />

        {/* /cost/add 경로: 신청 및 수정 폼 */}
        <Route 
          path="add" 
          element={
            <AmountForm 
              workcationNo={1} 
              editData={editTarget} 
              onSuccess={handleFormSuccess} 
              onCancelEdit={handleCancelEdit} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default AmountPage;
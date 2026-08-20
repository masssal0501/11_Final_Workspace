import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountDetail() {
  const { amountNo } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 📌 승인 입력 폼을 위한 상태값 정의
  const [approvedAmount, setApprovedAmount] = useState('');
  const [comment, setComment] = useState('');
  const [sponsorName, setSponsorName] = useState('회사지원금');
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [sponsorStatus, setSponsorStatus] = useState('PAID');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await amountApi.getAmountById(amountNo);
        setDetail(response);
        if (response) {
          setApprovedAmount(response.approvedAmount || response.requestedAmount || '');
          setSponsorAmount(response.requestedAmount || '');
          setComment(response.amountComment || '');
        }
      } catch (error) {
        console.error('상세 조회 실패:', error);
        alert('데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [amountNo]);

  // 📌 승인 처리 핸들러
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();

    const parsedApprovedAmt = Number(approvedAmount);
    const parsedSponsorAmt = Number(sponsorAmount);

    if (isNaN(parsedApprovedAmt) || parsedApprovedAmt < 0) {
      alert('올바른 승인 금액을 입력해 주세요.');
      return;
    }

    try {
      await amountApi.updateApproval(
        detail.amountNo, 
        'A', // 승인 상태로 변경
        parsedApprovedAmt, 
        comment, 
        sponsorName, 
        parsedSponsorAmt, 
        sponsorStatus, 
        remark
      );
      alert('승인 및 지원금 반영이 완료되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert('처리에 실패했습니다.');
    }
  };

  if (loading) return <div className="amount-container">로딩 중...</div>;
  if (!detail) return <div className="amount-container">조회된 데이터가 없습니다.</div>;

  const getStatusText = (status) => {
    const statusMap = {
      R: '검토중',
      A: '승인',
      J: '반려',
      H: '보류',
      C: '취소'
    };
    return statusMap[status] || status;
  };

  // 📌 수정/승인 가능 상태: 검토중('R')이거나 보류('H')일 때 허용
  const canEditable = detail.status === 'R' || detail.status === 'H';

  return (
    <div className="amount-container">
      <h2 className="amount-title admin">비용 정산 상세 내역 (#{detail.amountNo})</h2>
      
      <form onSubmit={handleApprovalSubmit} className="detail-box">
        {/* 1. 작성자 정보 */}
        <div className="info-row">
          <span className="info-label">작성자</span>
          <span className="info-value">{detail.empName || '정보 없음'}</span>
        </div>

        {/* 2. 신청 상태 */}
        <div className="info-row">
          <span className="info-label">상태</span>
          <span className="info-value">{getStatusText(detail.status)}</span>
        </div>

        {/* 3. 신청 금액 */}
        <div className="info-row">
          <span className="info-label">신청 금액</span>
          <span className="info-value">{detail.requestedAmount?.toLocaleString()} 원</span>
        </div>

        {/* 4. 승인 금액 */}
        <div className="info-row">
          <span className="info-label">승인 금액</span>
          <span className="info-value">
            {canEditable ? (
              <input 
                type="number" 
                value={approvedAmount} 
                onChange={(e) => setApprovedAmount(e.target.value)}
                required
                style={{ padding: '6px', width: '200px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            ) : (
              detail.approvedAmount ? `${detail.approvedAmount.toLocaleString()} 원` : '-'
            )}
          </span>
        </div>

        {/* 5. 신청 사유 / 결재 의견 */}
        <div className="info-row comment-row">
          <span className="info-label">신청 사유 / 의견</span>
          {canEditable ? (
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="결재 의견이나 반려/승인 사유를 입력하세요."
              rows="3"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}
            />
          ) : (
            <div className="info-comment">{detail.amountComment || '사유 없음'}</div>
          )}
        </div>

        {/* 6. 첨부파일 목록 */}
        <div className="file-section">
          <span className="info-label">첨부 파일</span>
          <div className="file-list-wrapper">
            {detail.fileList && detail.fileList.length > 0 ? (
              <ul className="file-list">
                {detail.fileList.map((file) => (
                  <li key={file.amountattachmentNo} className="file-item">
                    <a href={file.filePath} target="_blank" rel="noreferrer" className="file-link">
                      {file.originName}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-file">첨부된 파일이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 7. 지원금 입력 및 내역 영역 */}
        <div className="file-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', flexDirection: 'column' }}>
          <span className="info-label" style={{ marginBottom: '10px' }}>지원금 관련 정보</span>
          
          {canEditable ? (
            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'inline-block', width: '100px', fontSize: '14px', color: '#555' }}>지원기관명:</label>
                <input 
                  type="text" 
                  value={sponsorName} 
                  onChange={(e) => setSponsorName(e.target.value)} 
                  style={{ padding: '5px', width: '200px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'inline-block', width: '100px', fontSize: '14px', color: '#555' }}>지원금액:</label>
                <input 
                  type="number" 
                  value={sponsorAmount} 
                  onChange={(e) => setSponsorAmount(e.target.value)} 
                  style={{ padding: '5px', width: '200px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'inline-block', width: '100px', fontSize: '14px', color: '#555' }}>지급 상태:</label>
                <select 
                  value={sponsorStatus} 
                  onChange={(e) => setSponsorStatus(e.target.value)}
                  style={{ padding: '5px', width: '212px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="PAID">지급</option>
                  <option value="UNPAID">미지급</option>
                  <option value="HOLD">보류</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'inline-block', width: '100px', fontSize: '14px', color: '#555' }}>특이사항:</label>
                <input 
                  type="text" 
                  value={remark} 
                  onChange={(e) => setRemark(e.target.value)} 
                  placeholder="특이사항 입력"
                  style={{ padding: '5px', width: 'calc(100% - 110px)', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {detail.itemList && detail.itemList.some(item => item.sponsorList && item.sponsorList.length > 0) ? (
                detail.itemList.map(item => 
                  item.sponsorList?.map((sponsor, idx) => (
                    <div key={idx} style={{ background: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px' }}>
                      <p><strong>지원기관:</strong> {sponsor.sponsorName || '미지정'}</p>
                      <p><strong>지원금액:</strong> {sponsor.amount?.toLocaleString()} 원</p>
                      <p><strong>지급상태:</strong> {sponsor.status === 'PAID' ? '지급완료' : sponsor.status === 'HOLD' ? '보류' : '미지급'}</p>
                      {sponsor.remark && <p><strong>특이사항:</strong> {sponsor.remark}</p>}
                    </div>
                  ))
                )
              ) : (
                <p className="no-file">적용된 지원금 내역이 없습니다.</p>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="btn-group" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            목록으로
          </button>
          {canEditable && (
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#007bff', color: '#fff', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              승인 및 지원금 반영
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
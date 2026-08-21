import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { amountApi } from '../api/amountApi';
import '../styles/AmountStyle.css';

export default function AmountDetail() {
  const { amountNo } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // 승인 입력 폼 상태값 정의
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

  const canEditable = detail.status === 'R' || detail.status === 'H';

  // 계산 로직
  const totalExistingSponsorAmount = detail.itemList?.reduce((sum, item) => {
    const itemSponsors = item.sponsorList || [];
    return sum + itemSponsors.reduce((sSum, sponsor) => sSum + (sponsor.amount || 0), 0);
  }, 0) || 0;

  const currentApproved = Number(approvedAmount) || 0;
  const currentSponsor = canEditable ? (Number(sponsorAmount) || 0) : totalExistingSponsorAmount;
  const grandTotal = currentApproved + currentSponsor;

  // 승인 처리 핸들러
  const handleApprovalSubmit = async (e) => {
    e.preventDefault();

    const parsedApprovedAmt = Number(approvedAmount) || 0;
    const parsedSponsorAmt = Number(sponsorAmount) || 0;
    const requestedAmt = Number(detail.requestedAmount) || 0;
    
    // 📌 회사 승인 금액 + 지원금 합산이 신청 금액을 초과하는지 검증
    if (grandTotal > requestedAmt) {
      alert(`경고: 회사 승인 금액과 지원금의 합계(${grandTotal.toLocaleString()}원)가 신청 금액(${requestedAmt.toLocaleString()}원)을 초과할 수 없습니다.`);
      return;
    }

    if (isNaN(parsedApprovedAmt) || parsedApprovedAmt < 0) {
      alert('올바른 회사 승인 금액을 입력해 주세요.');
      return;
    }

    try {
      await amountApi.updateApproval(
        detail.amountNo, 
        'A', 
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

        {/* 4. 회사 승인 금액 */}
        <div className="info-row">
          <span className="info-label">회사 승인 금액</span>
          <span className="info-value">
            {canEditable ? (
              <input 
                type="number" 
                value={approvedAmount} 
                onChange={(e) => setApprovedAmount(e.target.value)}
                required
                className="sponsor-input"
                style={{ width: '200px' }}
              />
            ) : (
              detail.approvedAmount ? `${detail.approvedAmount.toLocaleString()} 원` : '-'
            )}
          </span>
        </div>

        {/* 실시간 경고 표시 */}
        {grandTotal > (detail.requestedAmount || 0) && (
          <div className="warning-text">
            ⚠️ 주의: 회사 승인 금액과 지원금 합계가 신청 금액을 초과했습니다.
          </div>
        )}

        {/* 4-1. 총합산 금액 (회사승인금액 + 지원금) 표시 영역 */}
        <div className="grand-total-row">
          <span className="grand-total-label">총합산 금액 (회사승인+지원)</span>
          <span className="grand-total-value">
            {grandTotal.toLocaleString()} 원
          </span>
        </div>

      

        {/* 5. 비용 항목 종류 및 상세 내용 */}
        <div className="info-row comment-row">
          <span className="info-label" style={{ width: '100%', marginBottom: '8px' }}>비용 항목 및 상세 내용</span>
          
          <div className="info-comment">
            {detail?.itemList && detail.itemList.length > 0 ? (
              detail.itemList.map((item, index) => {
                const typeMap = {
                  'S': '숙박',
                  'T': '교통',
                  'E': '식비',
                  'F': '체험',
                  'V': '공간대여',
                  'O': '기타'
                };
                const label = typeMap[item.itemType];
                const isLast = index === detail.itemList.length - 1;

                return (
                  <div key={index} className={`item-row ${isLast ? 'last' : ''}`}>
                    {label && (
                      <span className="item-badge">
                        {label}
                      </span>
                    )}
                    {item.itemDescription && (
                      <span className="item-desc">
                        {item.itemDescription}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <span style={{ color: '#666' }}>{detail.amountComment || '사유 없음'}</span>
            )}
          </div>
        </div>

        {/* 6. 첨부파일 목록 */}
        <div className="file-section info-row">
          <span className="info-label">첨부 파일</span>
          <div className="file-list-wrapper info-value">
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
          <span className="info-label" style={{ marginBottom: '10px', width: '100%' }}>지원금 관련 정보</span>
          
          {canEditable ? (
            <div className="sponsor-form-box">
              <div className="sponsor-input-row">
                <label className="sponsor-label">지원기관명:</label>
                <input 
                  type="text" 
                  value={sponsorName} 
                  onChange={(e) => setSponsorName(e.target.value)} 
                  className="sponsor-input"
                />
              </div>
              <div className="sponsor-input-row">
                <label className="sponsor-label">지원금액:</label>
                <input 
                  type="number" 
                  value={sponsorAmount} 
                  onChange={(e) => setSponsorAmount(e.target.value)} 
                  className="sponsor-input"
                />
              </div>
              <div className="sponsor-input-row">
                <label className="sponsor-label">지급 상태:</label>
                <select 
                  value={sponsorStatus} 
                  onChange={(e) => setSponsorStatus(e.target.value)}
                  className="sponsor-select"
                >
                  <option value="PAID">지급</option>
                  <option value="UNPAID">미지급</option>
                  <option value="HOLD">보류</option>
                </select>
              </div>
              <div className="sponsor-input-row">
                <label className="sponsor-label">특이사항:</label>
                <input 
                  type="text" 
                  value={remark} 
                  onChange={(e) => setRemark(e.target.value)} 
                  placeholder="특이사항 입력"
                  className="sponsor-input-flex"
                />
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {detail.itemList && detail.itemList.some(item => item.sponsorList && item.sponsorList.length > 0) ? (
                detail.itemList.map(item => 
                  item.sponsorList?.map((sponsor, idx) => (
                    <div key={idx} className="sponsor-card">
                      <p><strong>지원기관:</strong> {sponsor.sponsorName || '미지정'}</p>
                      <p><strong>지원금액:</strong> {sponsor.amount?.toLocaleString()} 원</p>
                      <p><strong>지급상태:</strong> {sponsor.status === 'PAID' ? '지급완료' : sponsor.status === 'HOLD' ? '보류' : '미지급'}</p>
                      {sponsor.remark && <p><strong>특이사항:</strong> {sponsor.remark}</p>}
                    </div>
                  ))
                )
              ) : (
                <p className="no-sponsor-text">적용된 지원금 내역이 없습니다. (지원금 미적용)</p>
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
            <button type="submit" className="btn btn-primary btn-approve">
              승인 및 지원금 반영
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
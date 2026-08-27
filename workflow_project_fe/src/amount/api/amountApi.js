import axios from 'axios';

// 백엔드 컨트롤러 매핑 경로와 동일하게 설정
const BASE_URL = '/api/v1/amounts';

export const amountApi = {
  // 📌 1. JSON 형태의 비용 정산 신청 (필요한 경우)
  createAmountJson: async (amountData) => {
    const response = await axios.post(BASE_URL, amountData);
    return response.data;
  },

  // 📌 2. 파일(FormData)을 포함한 비용 정산 신청 (현재 주로 사용하는 방식)
  createAmount: async (formData) => {
    const response = await axios.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 특정 워케이션 비용 목록 조회
 getAmountListByWorkcation: async (workcationNo, page = 1) => {

    const response = await axios.get(
        `/api/v1/amounts/workcation/${workcationNo}`,
        {
            params: {
                page: page
            }
        }
    );

    return response.data;
},

  // 단건 상세 조회
  getAmountById: async (amountNo) => {
    const response = await axios.get(`${BASE_URL}/${amountNo}`);
    return response.data;
  },

  // 비용 정산 수정
  updateAmount: async (amountNo, formData) => {
    const response = await axios.put(`${BASE_URL}/${amountNo}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 비용 신청 취소
  cancelAmount: async (amountNo) => {
    const response = await axios.patch(`${BASE_URL}/${amountNo}/cancel`);
    return response.data;
  },

  // 결재 상태 변경 및 지원금 반영 (관리자)
updateApproval: async (amountNo, status, approvedAmount, comment, sponsorName, sponsorAmount, sponsorStatus, remark) => {
  const response = await axios.patch(`${BASE_URL}/${amountNo}/approval`, null, {
    params: {
      status,
      approvedAmount,
      comment,
      sponsorName,
      sponsorAmount,
      sponsorStatus,
      remark,
    },
  });
  return response.data;
},

  getStatisticsData: async () => {
    const response = await axios.get('/api/v1/amounts/statistics');
    return response.data;
  }
};
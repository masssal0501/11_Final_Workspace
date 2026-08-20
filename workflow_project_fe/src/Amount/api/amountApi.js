import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/amounts';

export const amountApi = {
  // 1. 비용 검토 신청 등록 (POST)
  createAmount: async (amountData) => {
    const response = await axios.post(BASE_URL, amountData);
    return response.data;
  },

  // 2. 비용 신청 단건 상세 조회 (GET)
  getAmountDetail: async (amountNo) => {
    const response = await axios.get(`${BASE_URL}/${amountNo}`);
    return response.data;
  },

  // 3. 특정 워케이션의 비용 신청 목록 조회 (GET)
  getAmountListByWorkcation: async (workcationNo) => {
    const response = await axios.get(`${BASE_URL}/workcation/${workcationNo}`);
    return response.data;
  },

  // 4. 결재 승인 / 반려 / 보류 처리 (PATCH - Query Parameter 방식)
  updateApproval: async (amountNo, status, approvedAmount, comment) => {
    const response = await axios.patch(
      `${BASE_URL}/${amountNo}/approval`,
      null,
      {
        params: {
          status,
          approvedAmount,
          comment
        }
      }
    );
    return response.data;
  }
};
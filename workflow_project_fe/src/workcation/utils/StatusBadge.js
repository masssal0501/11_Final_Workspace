export const getStatusText = (status) => {

    const statusMap = {
        A: "승인",
        C: "취소",
        H: "보류",
        J: "반려",
        R: "검토",
        W: "대기"
    };

    return statusMap[status] || status;
};
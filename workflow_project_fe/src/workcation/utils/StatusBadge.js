// 워케이션 approver_state 코드 -> 화면 표시용 한글 라벨/배지 톤 공통 유틸.
// BUG-006: 여러 화면(WorkcationListComponent, MyWorkcationListComponent,
// ApprovalQueueList 등)이 각자 자체 labelMap을 복제해서 갖고 있었고, 그 결과
// 일부 화면에서는 TODO-N03에서 추가된 "D"(완료) 코드가 누락되어 원본 코드
// 글자가 그대로 노출되는 문제가 있었다. 상태값 -> 표시명 변환은 이 파일 하나로
// 통일한다. DB의 실제 코드값 자체는 변경하지 않는다.
const STATUS_LABEL_MAP = {
    W: "대기",
    R: "검토중",
    A: "승인",
    J: "반려",
    C: "취소",
    H: "보류",
    D: "완료",
};

const STATUS_TONE_MAP = {
    W: "bg-warning",
    R: "bg-primary",
    A: "bg-success",
    J: "bg-danger",
    C: "bg-secondary",
    H: "bg-secondary",
    D: "bg-success",
};

export const getStatusText = (status) => {
    return STATUS_LABEL_MAP[status] || status;
};

export const getStatusTone = (status) => {
    return STATUS_TONE_MAP[status] || "bg-secondary";
};

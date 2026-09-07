export const getStatusText = (status) => {
    switch (status) {
        case "W":
            return "검토";
        case "Y":
            return "승인";
        case "C":
            return "취소";
        case "H":
            return "보류";
        case "R":
            return "반려";
            default:
                return "-";
    }
};
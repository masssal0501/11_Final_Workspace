import axiosInstance from "../../common/api/axiosInstance";

//1.메인지역
export const getMainRegionList = async () => {
    const response = await axiosInstance.get("/workcation/hub/mainRegion");
    return response.data;
};
//서브
export const getSubRegionList = async (mainRegion) => {
    const response = await axiosInstance.get("/workcation/hub/subRegion", {
        params: { mainRegion }
    });
    return response.data;
};

//워케이션 목록 조회
export const getWorkcationList = async (params) => {
    const response = await axiosInstance.get("/workcation/list", { params });
    return response.data;
};

//상세조회
export const getWorkcationDetail = async (workcationNo) => {
    const response = await axiosInstance.get(`/workcation/detail/${workcationNo}`);
    return response.data;
};
//워케이션 등록
export const enrollWorkcation = async (insertworkcationData) => {
    const response = await axiosInstance.post("/workcation/hub/enrollForm", insertworkcationData);
    return response;
}

//내 워케이션 리스트
export const getMyWorkcationList = async (params) => {
    const response = await axiosInstance.get("/workcation/mylist", { params });
    return response.data;
};

// 내 워케이션 상세조회
export const getMyWorkcationDetail = async (workcationNo) => {
    const response = await axiosInstance.get(`/workcation/mydetail/${workcationNo}`);
    return response.data;
};

//수정
export const updateWorkcation = async (workcationNo, updateData) => {
    const response = await axiosInstance.put(`/workcation/update/${workcationNo}`, updateData);
    return response;
}

//삭제
export const deleteWorkcation = async (workcationNo) => {
    const response = await axiosInstance.delete(`/workcation/delete/${workcationNo}`);
    return response.data;
}

//회사 지우너금 정보조회
export const getSupportInfo = async () => {
    const response = await axiosInstance.get("/workcation/amount/supportInfo");
    return response.data;
};

//거점 및 옵션장소 조회
export const getHubList = async (params) => {
    const response = await axiosInstance.get("/workcation/hub/list", { params });
    return response.data;
};

//진행률 저장
// BUG-010: 백엔드(PUT /workcation/task/{taskNo})는 progress/title/content/file을
// @RequestParam(멀티파트 폼 필드)으로 받는데, 기존 코드는 formData를 만들어놓고
// 실제로는 JSON 바디로 보내고 있어 필수 파라미터 바인딩이 항상 실패했다(400).
export const saveTaskProgress = async (data, file) => {

    const formData = new FormData();

    formData.append("progress", data.progress);
    formData.append("title", data.title);
    formData.append("content", data.content);

    if (file) {
        formData.append("file", file);
    }

    const response = await axiosInstance.put(
        `/workcation/task/${data.taskNo}`,
        formData,
        { headers: { "Content-Type": undefined } }
    );

    return response.data;
};

//워케이션 리스트 일정 조회
export const getWorkcationSchedule = async (date) => {

    const response = await axiosInstance.get(
        "/workcation/schedule",
        { params: { date } }
    );

    return response.data;
}

//내 워케이션 첨부파일업로드
export const uploadWorkFile = async (workcationNo, file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await axiosInstance.post(
        `/workcation/${workcationNo}/file`,
        formData,
        { headers: { "Content-Type": undefined } }
    );

    return response.data;
};

//첨부 다운로드
export const downloadWorkFile = async (taskFileNo, originName) => {

    const response = await axiosInstance.get(
        `/workcation/file/${taskFileNo}/download`,
        { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(
        new Blob([response.data])
    );

    const link = document.createElement("a");

    link.href = url;
    link.download = originName;

    document.body.appendChild(link);

    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
};

export const getWorkFilePreview = async (taskFileNo) => {

    const response =
        await axiosInstance.get(
            `/workcation/file/${taskFileNo}/download`,
            {
                responseType: "blob"
            }
        );

    return response.data;
};


export const deleteWorkFile = async (taskFileNo) => {
    const response = await axiosInstance.delete(`/workcation/file/${taskFileNo}`);
    return response.data;
};
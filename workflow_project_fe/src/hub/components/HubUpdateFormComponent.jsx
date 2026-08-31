import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { selectHubApi, updateHubApi, BASE_URL } from "../api/hubApi"
import "../styles/Hub.css";

// 거점(장소) 정보를 수정하는 React 컴포넌트
function HubUpdateFormComponent(props) {

    // 새로 첨부 또는 변경된 실제 File 객체를 저장하는 배열
    const [files, setFiles] = useState([null, null, null]);
    // 화면에 보여줄 이미지 미리보기 경로
    const [previews, setPreviews] = useState([null, null, null]);
    // 서버에 이미 저장되어 있던 기존 첨부파일의 PK를 저장하는 배열
    const [fileNos, setFileNos] = useState([null, null, null]);
    // 현재 파일 선택창이나 드래그앤드롭으로 변경 중인 슬롯의 인덱스
    const [targetIndex, setTargetIndex] = useState(null);
    // React Router의 useParams를 통해 URL 경로 파라미터에서 hubNo 추출
    const hubNo = useParams().hubNo;
    // 거점 상세 정보 폼 데이터를 관리하는 통합 객체 State
    const [hub, setHub] = useState({
        hubNo : hubNo,
        mainRegion : "",
        subRegion : "",
        hubName : "",
        hubAddress : "",
        phone : "",
        description : "",
        hubType : 0,
        price : 0,
        maxCapacity : "",
        hubStatus : "",
        hubFileList : []
    });
    
    // 로그인한 사용자 정보 불러오기
    const loginUser = props.loginUser;

    // Kakao 우편번호 서비스 API 사용을 위한 window 객체 참조
    const { kakao } = window;

    // 페이지 이동을 제어하는 React Router 훅
    const navigate = useNavigate();
    // 숨겨진 <input type="file"> 요소에 직접 접근하기 위한 Ref
    const upfileRef = useRef(null);
    // <form> 요소의 HTML5 유효성 검사 실행을 위한 Ref
    const formRef = useRef(null);

    // 컴포넌트 마운트 시 또는 hubNo가 변경될 때 해당 거점의 기존 정보를 서버에서 조회
    useEffect(() =>{
        const selectBoard = async () => {
            try {
                // 비동기 API 호출: 거점 상세 정보 조회
                const response = await selectHubApi(hubNo);

                // 조회 결과 데이터가 존재하는 경우
                if(response.data != "") {
                    const HubData = response.data.hub;
                    setHub(HubData);

                    // 기존에 등록된 첨부파일 목록이 존재하는 경우 처리
                    if (HubData.hubFileList && HubData.hubFileList.length > 0) {
                        const loadedPreviews = [null, null, null];
                        const loadedFileNos = [null, null, null];

                        // 최대 3개까지 기존 파일 정보를 슬롯에 바인딩
                        HubData.hubFileList.forEach((item, index) => {
                            if (index < 3) {
                                // 서버 경로 + 변경된 파일명을 결합하여 이미지 절대 URL 생성
                                loadedPreviews[index] = `${BASE_URL.replace('/hubs', '')}${item.filePath}/${item.changeName}`;
                                // 기존 파일 PK 저장
                                loadedFileNos[index] = item.hubfileNo;
                            }
                        });
                        setPreviews(loadedPreviews);
                        setFileNos(loadedFileNos);
                    }

                } else {
                    // 데이터가 없는 경우 경고창 띄우고 목록으로 리다이렉트
                    alert("이미 삭제되었거나 없는 거점입니다.");
                    navigate("/placeInfo/list")
                }

            } catch(error) {
                console.error(error);
            }
        }

        selectBoard();
    }, [hubNo]);

    // 첨부된 파일 검증 및 State에 반영하는 함수
    const processAndSetFile = (file, index) => {
        // 이미지 파일 타입 검증
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            return;
        }

        // FileReader를 이용한 이미지 데이터 읽기
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            // 원본 파일 객체 배열 업데이트
            setFiles(prev => {
                const next = [...prev];
                next[index] = file;
                return next;
            });

            // 미리보기 URL 배열 업데이트
            setPreviews(prev => {
                const next = [...prev];
                next[index] = e.target.result;
                return next;
            });

            // 기존 서버 파일 번호 초기화
            setFileNos(prev => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
        };
    };

    // 폼 입력값 변경 공통 핸들러
    const handleChange = e => {
        const newHubData = { ...hub };
        // e.target.name에 지정된 속성명만 동적으로 업데이트
        newHubData[e.target.name] = e.target.value;
        setHub(newHubData);
    }

    // 폼 입력값 양옆 공백 삭제 핸들러
    const handleBlur = e => {
        const newHubData = { ...hub };

        newHubData[e.target.name] = e.target.value.trim();
        setHub(newHubData);
    }

    // 카카오 우편번호 서비스 팝업 오픈 및 주소/지역 선택 핸들러
    const handleAddressSearch = () => {
        new kakao.Postcode({
            oncomplete: (data) => {
                let address = data.roadAddress;
                let sido = data.sido.substring(0, 2);
                let sigungu = data.sigungu;
                let buildingName = data.buildingName

                // 서비스 허용 지역 조건 검증
                if(sido === "강원" || sido === "제주" || sido === "부산") {
                    const region = {...hub}
                    region.hubAddress = address;
                    region.mainRegion = sido;
                    region.subRegion = sigungu;
                    region.hubName = buildingName
                    setHub(region);
                } else {
                    alert("지역은 강원, 제주, 부산만 가능합니다. ");
                }
            }
        }).open();
    };

    // 이미지 업로드 영역 클릭 시 실제 파일 입력창을 트리거하는 함수
    const handleAreaClick = (index) => {
        setTargetIndex(index);
        if (upfileRef.current) {
            upfileRef.current.click();
        }
    };

    // <input type="file">을 통한 파일 선택 이벤트 핸들러
    const handleFileChange = e => {
        const selectedFile = e.target.files[0];

        // 파일 선택을 취소했을 때의 예외 처리
        if(!selectedFile) {
            // 이미 기존 파일이나 미리보기가 존재하던 슬롯이었다면 해당 파일 삭제 처리
            if(targetIndex !== null && files[targetIndex] !== null) {
                handleRemoveImage(targetIndex);
            }
            return;
        }

        // 선택된 파일 읽기 및 State 업데이트
        processAndSetFile(selectedFile, targetIndex);
        setTargetIndex(null);
        e.target.value = "";
    }

    // 드래그 요소가 영역 위에 올라왔을 때 브라우저 기본 동작 방지
    const handleDragOver = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 드롭 영역에 파일을 떨어뜨렸을 때 처리하는 핸들러
    const handleDrop = (index, e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            processAndSetFile(droppedFiles[0], index);
        }
    };

    // 특정 위치의 첨부 이미지 및 관련 State 전체 삭제
    const handleRemoveImage = (index, e) => {
        if (e) e.stopPropagation();

        // 신규 선택 파일 삭제
        setFiles(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });

        // 미리보기 경로 삭제
        setPreviews(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
        // 기존 서버 파일 PK 삭제
        setFileNos(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    };

    // 수정 폼 데이터를 Multipart/FormData 형태로 구성하여 백엔드 서버로 비동기 전송
    const updateHub = async e => {
        e.preventDefault();

        // HTML5 폼 필수/조건 유효성 검사 수행
        if(!formRef.current.checkValidity()){
            formRef.current.reportValidity();
            return;
        }

        // 대표 이미지 필수 등록 검증
        if(!files[0] && !previews[0]) {
            alert("대표이미지는 최소 1개 이상 등록해야 합니다.");
            return;
        }

        try {
            // 파일 업로드가 포함되므로 multipart/form-data 처리를 위한 FormData 객체 생성
            const formData = new FormData();

            // 반복문을 사용하여 일일이 append 하던 코드를 한 줄로 압축
            Object.keys(hub).forEach(key => {
                if (key !== "hubFileList" && key !== "hubNo" && hub[key] !== null) {
                    formData.append(key, hub[key]);
                }
            });

            // 유지할 기존 파일 번호들을 FormData에 append
            fileNos.forEach(fileNo => {
                if (fileNo) {
                    formData.append("fileNos", fileNo);
                }
            });

            // 새로 추가/교체된 파일 객체만 필터링하여 FormData에 append
            files.forEach((f, index) => {
                if (f !== null) {
                    formData.append("upfiles", f);
                    formData.append("upfileIndexes", index);
                }
            });

            // API 함수 호출
            const response = await updateHubApi(hubNo, formData);

            // 서버 응답 결과 처리
            if(response.data == "success") {
                alert("거점 수정에 성공했습니다.");
                navigate("/hub/list");
            } else {
                alert("거점 수정에 실패했습니다.");
            }

        } catch(error) {
           // 파일 용량 초과 에러 예외 처리
            if(error.response && error.response.status === 413) {
                alert("이미지의 용량이 너무 큽니다. 파일 크기를 줄여서 다시 시도해주세요.")
           } else {
                console.error(error);
           }    
        }
    };

    // return 구문
    return(
        <div className="content">
            { (loginUser.authCode === "ADMIN") ? (
                <>
                    <h2 align="center"><b>거점 수정</b></h2>
                    <br />
                    {/* 거점 수정 입력 폼 */}
                    <form ref={formRef}>
                        <table width="100%" className="hub-table">
                            <tbody>
                                {/* 사용 가능 인원, 운영 여부, 거점 유형 */}
                                <tr>
                                    <th>사용 가능 인원</th>
                                    <td colSpan="3">
                                        <div className="input-group col-9">
                                            <input
                                                type="number"
                                                min="1"
                                                className="form-control"
                                                placeholder="0"
                                                name="maxCapacity"
                                                value={ hub.maxCapacity }
                                                onChange={ handleChange }
                                                onBlur={ handleBlur }
                                                required
                                            />&nbsp;<p>명</p>
                                        </div>
                                    </td>
                                    <th>운영 여부</th>
                                    <td>
                                        <label htmlFor="OPEN"><input
                                            type="radio"
                                            name="hubStatus"
                                            id="OPEN"
                                            value="OPEN"
                                            checked={ hub.hubStatus == "OPEN" }
                                            onChange={ handleChange }/>운영중
                                        </label>&nbsp;
                                        <label htmlFor="PAUSED"><input
                                            type="radio"
                                            name="hubStatus"
                                            id="PAUSED"
                                            value="PAUSED"
                                            checked={ hub.hubStatus == "PAUSED" }
                                            onChange={ handleChange }/>일시중단
                                        </label>
                                    </td>
                                </tr>
                                {/* 카카오 주소 검색 및 지역 */}
                                <tr>
                                    <th>주소</th>
                                    <td colSpan="3">
                                        <input
                                            type="text"
                                            name="hubAddress"
                                            className="form-control"
                                            placeholder="주소를 입력해주세요."
                                            value={ hub.hubAddress }
                                            onClick={ handleAddressSearch }
                                            autoComplete="off"
                                            onChange={ handleChange }
                                            required/>
                                    </td>
                                    <th>지역</th>
                                    <td>
                                        <div className="d-flex">
                                            <input
                                                className="form-control"
                                                name="mainRegion"
                                                value={ hub.mainRegion }
                                                onChange={ handleChange }
                                                readOnly
                                                required />
                                            <input
                                                className="form-control"
                                                name="subRegion"
                                                value={ hub.subRegion }
                                                onChange={ handleChange }
                                                readOnly
                                                required />
                                        </div>
                                    </td>
                                </tr>
                                {/* 전화번호 */}
                                <tr>
                                    <th>전화번호</th>
                                    <td colSpan="3">
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            maxLength="13"
                                            placeholder="전화번호를 입력해주세요.(-포함)"
                                            value={ hub.phone }
                                            onChange={ handleChange }
                                            onBlur={ handleBlur }
                                            required />
                                    </td>
                                    <th>유형</th>
                                    <td>
                                        <select
                                            className="custom-select"
                                            name="hubType"
                                            value={ hub.hubType }
                                            onChange={ handleChange }>
                                            <option value="1">숙소</option>
                                            <option value="2">공유오피스</option>
                                        </select>
                                    </td>
                                </tr>
                                {/* 거점 이름 */}
                                <tr>
                                    <th>거점 이름</th>
                                    <td colSpan="5">
                                        <input
                                            type="text"
                                            name="hubName"
                                            className="form-control"
                                            maxLength="20"
                                            placeholder="거점 이름을 입력해주세요."
                                            value={ hub.hubName }
                                            onChange={ handleChange }
                                            onBlur={ handleBlur }
                                            required />
                                    </td>
                                </tr>
                                {/* 거점 설명 */}
                                <tr>
                                    <th>거점 설명</th>
                                    <td colSpan="5">
                                        <textarea
                                            rows="10"
                                            name="description"
                                            className="form-control"
                                            style={ { resize : "none" } }
                                            placeholder="이용시간 및 세부내용을 작성해주세요."
                                            maxLength="300"
                                            value={ hub.description }
                                            onChange={ handleChange }
                                            onBlur={ handleBlur } >
                                        </textarea>
                                    </td>
                                </tr>
                                {/* 첨부 이미지 드래그앤드롭/클릭 영역 */}
                                <tr>
                                    <th>첨부 이미지</th>
                                    <td colSpan="5">
                                        <div className="d-flex hub-form" style={{ gap: "15px" }}>
                                            {[0, 1, 2].map((index) => (
                                                <div 
                                                    key={index}
                                                    onClick={() => handleAreaClick(index)}
                                                    onDragEnter={handleDragOver}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(index, e)}
                                                    style={{
                                                        border: previews[index] ? "none" : "2px dashed #ccc",
                                                    }}
                                                >
                                                    {/* 미리보기 이미지 유무에 따른 조건부 렌더링 */}
                                                    {previews[index] ? (
                                                        <>
                                                            <img src={previews[index]} width="100%" height="100%" alt={`첨부 이미지 ${index + 1}`} style={{ objectFit: "cover", borderRadius: "6px" }} />
                                                            {/* 이미지 개별 삭제 버튼 */}
                                                            <button type="button" onClick={(e) => handleRemoveImage(index, e)} style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "11px" }}>
                                                                취소
                                                            </button>
                                                        </>
                                                    ) : (
                                                        /* 이미지 미등록 상태의 가이드 문구 */
                                                        <>
                                                            <span style={{ color: "#888", fontSize: "12px" }}>
                                                                {index === 0 ? "대표 이미지 *" : `추가 이미지 ${index}`}
                                                            </span>
                                                            <span style={{ color: "#aaa", fontSize: "10px", marginTop: "4px" }}>클릭 또는 드래그</span>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                                {/* 가격 입력 */}
                                <tr>
                                    <th>가격/1일 기준<div style={{ fontSize : "12px" }}>숙소는 1박 기준!</div></th>
                                    <td className="input-group col-9" colSpan="5">
                                        <input
                                            type="number"
                                            name="price"
                                            className="form-control"
                                            placeholder="0"
                                            min="0"
                                            value={ hub.price }
                                            onChange={ handleChange }
                                            onBlur={ handleBlur }
                                            required />
                                        &nbsp;<p>원</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 실제 파일 업로드를 동작시키는 숨겨진 파일 Input */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={ upfileRef }
                            style={ { display : "none" } }
                            onChange={ handleFileChange }
                        />
                        <br />
                    
                        {/* 하단 동작 버튼 */}
                        <button type="submit" className="btn btn-primary" onClick={ updateHub }>수정하기</button>
                        <button type="button" className="btn btn-dark" style={ { float : "right", borderRadius : "99px" } } onClick={ () => { navigate(-1); } }>뒤로가기</button>
                    </form>
                </>
            ) : (
                <h2 align="center"><b>해당 페이지는 관리자만 올 수 있습니다.</b></h2>
            ) }
        </div>
    )
}

export default HubUpdateFormComponent;
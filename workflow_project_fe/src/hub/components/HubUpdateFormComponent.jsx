import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { selectHubApi, updateHubApi, BASE_URL } from "../api/hubApi"
import "../styles/Hub.css";

// 거점 정보 수정 컴포넌트
function HubUpdateFormComponent(props) {

    // 첨부파일 관련 상태 (최대 3개 슬롯)
    const [files, setFiles] = useState([null, null, null]);
    const [previews, setPreviews] = useState([null, null, null]);
    const [fileNos, setFileNos] = useState([null, null, null]);
    const [targetIndex, setTargetIndex] = useState(null);
    
    // URL 파라미터에서 거점 PK 추출
    const hubNo = useParams().hubNo;
    
    // 거점 상세 폼 데이터 State
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
    
    const loginUser = props.loginUser;
    const { kakao } = window;
    const navigate = useNavigate();
    
    // DOM 요소 접근 Ref
    const upfileRef = useRef(null);
    const formRef = useRef(null);

    // 컴포넌트 마운트 시 기존 거점 정보 조회
    useEffect(() =>{
        const selectBoard = async () => {
            try {
                const response = await selectHubApi(hubNo);

                if(response.data != "") {
                    const HubData = response.data.hub;
                    setHub(HubData);

                    // 기존 첨부파일 데이터가 있다면 미리보기 및 PK 세팅
                    if (HubData.hubFileList && HubData.hubFileList.length > 0) {
                        const loadedPreviews = [null, null, null];
                        const loadedFileNos = [null, null, null];

                        HubData.hubFileList.forEach((item, index) => {
                            if (index < 3) {
                                // 기존 이미지 절대 경로 생성
                                loadedPreviews[index] = `${BASE_URL.replace('/hubs', '')}${item.filePath}/${item.changeName}`;
                                loadedFileNos[index] = item.hubfileNo;
                            }
                        });
                        setPreviews(loadedPreviews);
                        setFileNos(loadedFileNos);
                    }
                } else {
                    alert("이미 삭제되었거나 없는 거점입니다.");
                    navigate("/placeInfo/list")
                }
            } catch(error) {
                console.error(error);
            }
        }

        selectBoard();
    }, [hubNo]);

    // 첨부 파일 검증 및 State 업데이트
    const processAndSetFile = (file, index) => {
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            // 신규 파일 객체 저장
            setFiles(prev => {
                const next = [...prev];
                next[index] = file;
                return next;
            });

            // 미리보기 URL 저장
            setPreviews(prev => {
                const next = [...prev];
                next[index] = e.target.result;
                return next;
            });

            // 새 파일로 교체되었으므로 기존 서버 파일 PK 제거
            setFileNos(prev => {
                const next = [...prev];
                next[index] = null;
                return next;
            });
        };
    };

    // 폼 입력값 변경 핸들러
    const handleChange = e => {
        const newHubData = { ...hub };
        // e.target.name에 지정된 속성명만 동적으로 업데이트
        newHubData[e.target.name] = e.target.value;
        setHub(newHubData);
    }

    // 폼 입력값 공백 제거 핸들러 (onBlur)
    const handleBlur = e => {
        const newHubData = { ...hub };

        newHubData[e.target.name] = e.target.value.trim();
        setHub(newHubData);
    }

    // 카카오 우편번호 API 호출 및 주소 맵핑
    const handleAddressSearch = () => {
        new kakao.Postcode({
            oncomplete: (data) => {
                let address = data.roadAddress;
                let sido = data.sido.substring(0, 2);
                let sigungu = data.sigungu;
                let buildingName = data.buildingName

                // 특정 서비스 지역(강원, 제주, 부산)만 허용
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

    // 이미지 슬롯 클릭 시 파일 입력창 트리거
    const handleAreaClick = (index) => {
        setTargetIndex(index);
        if (upfileRef.current) {
            upfileRef.current.click();
        }
    };

    // 파일 선택 완료 이벤트
    const handleFileChange = e => {
        const selectedFile = e.target.files[0];

        // 파일 선택 취소 시 기존 파일 삭제 처리
        if(!selectedFile) {
            if(targetIndex !== null && files[targetIndex] !== null) {
                handleRemoveImage(targetIndex);
            }
            return;
        }

        processAndSetFile(selectedFile, targetIndex);
        setTargetIndex(null);
        e.target.value = "";
    }

    // 드래그앤드롭 이벤트 방지
    const handleDragOver = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 파일 드롭 이벤트 처리
    const handleDrop = (index, e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            processAndSetFile(droppedFiles[0], index);
        }
    };

    // 특정 슬롯의 이미지 제거
    const handleRemoveImage = (index, e) => {
        if (e) e.stopPropagation();

        setFiles(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });

        setPreviews(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });

        setFileNos(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    };

    // 거점 수정 폼 제출 (비동기)
    const updateHub = async e => {
        e.preventDefault();

        // 필수 입력값 및 유효성 검사
        if(!formRef.current.checkValidity()){
            formRef.current.reportValidity();
            return;
        }

        // 대표 이미지 유무 검증
        if(!files[0] && !previews[0]) {
            alert("대표이미지는 최소 1개 이상 등록해야 합니다.");
            return;
        }

        try {
            const formData = new FormData();

            // 반복문을 사용하여 일일이 append 하던 코드를 한 줄로 압축
            Object.keys(hub).forEach(key => {
                if (key !== "hubFileList" && key !== "hubNo" && hub[key] !== null) {
                    formData.append(key, hub[key]);
                }
            });

            // 유지할 기존 서버 파일 PK Append
            fileNos.forEach(fileNo => {
                if (fileNo) {
                    formData.append("fileNos", fileNo);
                }
            });

            // 신규 등록/수정된 File 객체 및 슬롯 인덱스 Append
            files.forEach((f, index) => {
                if (f !== null) {
                    formData.append("upfiles", f);
                    formData.append("upfileIndexes", index);
                }
            });

            const response = await updateHubApi(hubNo, formData);

            if(response.data == "success") {
                alert("거점 수정에 성공했습니다.");
                navigate("/hub/list");
            } else {
                alert("거점 수정에 실패했습니다.");
            }

        } catch(error) {
            if(error.response && error.response.status === 413) {
                alert("이미지의 용량이 너무 큽니다. 파일 크기를 줄여서 다시 시도해주세요.")
           } else {
                console.error(error);
           }    
        }
    };

    // return 구문
    return(
        <div className="hub-content">
            { (loginUser.authCode === "ADMIN") ? (
                <>
                    <h2 align="center" className="hub-header"><b>거점 수정</b></h2>
                    <br />
                    <form ref={formRef}>
                        <table width="100%" className="hub-table">
                            <tbody>
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
                                                    {previews[index] ? (
                                                        <>
                                                            <img src={previews[index]} width="100%" height="100%" alt={`첨부 이미지 ${index + 1}`} style={{ objectFit: "cover", borderRadius: "6px" }} />
                                                            <button type="button" onClick={(e) => handleRemoveImage(index, e)} style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "11px" }}>
                                                                취소
                                                            </button>
                                                        </>
                                                    ) : (
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
                        <input
                            type="file"
                            accept="image/*"
                            ref={ upfileRef }
                            style={ { display : "none" } }
                            onChange={ handleFileChange }
                        />
                        <br />
                    
                        <button type="submit" className="btn btn-primary hub-primary" onClick={ updateHub }>수정하기</button>
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
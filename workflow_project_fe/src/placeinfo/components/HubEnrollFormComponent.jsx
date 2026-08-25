import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// 백엔드 통신 API 함수 및 스타일시트 임포트
import { insertHubApi } from "../api/placeinfoApi"
import "../styles/HubEnrollFormComponent.css";

function HubEnrollFormComponent() {

    // 파일 관련 State
    const [files, setFiles] = useState([null, null, null]);
    const [previews, setPreviews] = useState([null, null, null]);
    const [targetIndex, setTargetIndex] = useState(null);

    const navigate = useNavigate();
    const upfileRef = useRef(null);

    const formRef = useRef(null);

    // 폼 입력값 통합 State 관리 (객체 형태)
    const [hubData, setHubData] = useState({
        mainRegion : "",
        subRegion : "",
        hubName : "",
        hubAddress : "",
        phone : "",
        description : "",
        hubType : "1",
        price : 0,
        maxCapacity : 1,
        hubStatus : "OPEN"
    });

    // 폼 입력값 변경 공통 핸들러
    const handleChange = e => {
        const newHubData = { ...hubData };
        // e.target.name에 지정된 속성명만 동적으로 업데이트
        newHubData[e.target.name] = e.target.value;
        setHubData(newHubData);
    }

    // 폼 입력값 양옆 공백 삭제 핸들러
    const handleBlur = e => {
        const newHubData = { ...hubData };

        newHubData[e.target.name] = e.target.value.trim();
        setHubData(newHubData);
    }

    // 카카오 주소 검색 API
    const handleAddressSearch = () => {
        new kakao.Postcode({
            oncomplete: (data) => {
                // 도로명 주소 표기 규칙에 따른 주소 조합
                let address = data.address;
                let sido = data.sido.substring(0, 2);
                let sigungu = data.sigungu;
                let extraAddress = "";

                // 법정동명 및 건물명 조합 (도로명 주소일 경우)
                if (data.addressType === "R") {
                    if (data.bname !== "") {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== "") {
                        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
                    }
                    address += extraAddress !== "" ? ` (${extraAddress})` : "";
                }

                if(sido === "강원" || sido === "제주" || sido === "부산") {
                    // hubData의 hubAddress 값 업데이트
                    setHubData(prevData => ({
                        ...prevData,
                        hubAddress : address,
                        mainRegion :  sido,
                        subRegion : sigungu
                    }));
                } else {
                    alert("지역은 강원, 제주, 부산만 가능합니다. ");
                    return;
                }
               
            }
        }).open();
    };

    // 이미지 업로드 영역 클릭 시 실제 파일 입력창(input)을 트리거하는 함수
    const handleAreaClick = (index) => {
        setTargetIndex(index);
        if (upfileRef.current) {
            upfileRef.current.click();
        }
    };

    // 파일 유효성 검사 및 FileReader를 통한 미리보기 생성 공통 함수
    const processFile = (selectedFile) => {
        // 이미지 파일 형식 검증 (image/png, image/jpeg 등)
        if (!selectedFile.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            return;
        }

        
    };

    // <input type="file">을 통한 파일 선택 이벤트 핸들러
    const handleFileChange = e => {
        const selectedFile = e.target.files[0];

        if(!selectedFile) {
            if(targetIndex !== null && files[targetIndex] !== null) {
                handleRemoveImage(targetIndex);
            }
            return;
        }

        // 이미지 파일 형식 검증 (image/png, image/jpeg 등)
        if (!selectedFile.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            e.target.value = "";
            return;
        }

        // FileReader API로 파일 읽기
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = e => {
            const newPreview = e.target.result;
            
            setFiles(prev => {
                const next = [...prev];
                next[targetIndex] = selectedFile;
                return next;
            });
            setPreviews(prev => {
                const next = [...prev];
                next[targetIndex] = newPreview;
                return next;
            });
            setTargetIndex(null);
        };

        processFile(selectedFile);
    }

    // 드래그 요소가 영역 위에 올라왔을 때 브라우저 기본 동작(파일 열기) 방지
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
            const file = droppedFiles[0]

            if(!file.type.startsWith("image/")) {
                alert("이미지 파일만 첨부 가능합니다.");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = e => {      
                setFiles(prev => {
                    const next = [...prev]
                    next[index] = file;
                    return next;
                });
                setPreviews(prev => {
                    const next = [...prev];
                    next[index] = e.target.result;
                    return next;
                });  
            };
        }
    };

    // 특정 위치 이미지 삭제
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
    };

    // 서버로 거점 등록 데이터(FormData)를 전송하는 비동기 함수
    const insertHub = async e => {
        // 버튼 클릭 시 기본 submit 폼 제출 및 페이지 리로드 동작 방지
        e.preventDefault();

        if(!formRef.current.checkValidity()){
            formRef.current.reportValidity();
            return;
        }
        if(!files[0]) {
            alert("이미지는 최소 1개 이상 등록해야 합니다.");
            return;
        }

        try {
            // 파일 업로드가 포함되므로 multipart/form-data 처리를 위한 FormData 객체 생성
            const formData = new FormData();

            // 폼 데이터를 키-값 쌍으로 추가
            formData.append("mainRegion", hubData.mainRegion);
            formData.append("subRegion", hubData.subRegion);
            formData.append("hubName", hubData.hubName);
            formData.append("hubAddress", hubData.hubAddress);
            formData.append("phone", hubData.phone);
            formData.append("description", hubData.description);
            formData.append("hubType", hubData.hubType);
            formData.append("price", hubData.price);
            formData.append("maxCapacity", hubData.maxCapacity);
            formData.append("hubStatus", hubData.hubStatus);

            // Hub_file 테이블 저장을 위해 첨부된 파일들 append
            files.filter(f => f !== null).forEach(f => {
                formData.append("upfile", f);
            });

            // API 함수 호출 (Axios 등을 통한 POST 요청)
            const response = await insertHubApi(formData);

            // 서버 응답 결과 처리
            if(response.data == "success") {
                alert("거점 등록에 성공했습니다.");
                navigate("/placeInfo/list"); // 성공 시 리스트 페이지로 이동
            } else {
                alert("거점 등록에 실패했습니다.");
            }

        } catch(error) {
           if(error.response && error.response.status === 413) {
                alert("이미지의 용량이 너무 큽니다. 파일 크기를 줄여서 다시 시도해주세요.")
           } else {
                console.log("거점 등록용 ajax 통신 실패!");
           }    
        }
    };

    return(
        <div className="content">
            <h2 align="center"><b>거점 등록</b></h2>
            <br />
            {/* 폼 제출 엔터 키 지원을 위해 onSubmit에 insertHub 연결 권장 */}
            <form onSubmit={insertHub} ref={formRef}>
                <table width="100%">
                    <tbody>
                        <tr>
                            <th>사용 가능 인원</th>
                            <td className="input-group col-5">
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    placeholder="0"
                                    name="maxCapacity"
                                    value={ hubData.maxCapacity }
                                    onChange={ handleChange }
                                    onBlur={ handleBlur }
                                />&nbsp;<p>명</p>
                            </td>
                            <th>운영 여부</th>
                            <td>
                                <input
                                    type="radio"
                                    name="hubStatus"
                                    id="OPEN"
                                    value="OPEN"
                                    checked={ hubData.hubStatus == "OPEN" }
                                    onChange={ handleChange }/>
                                <label htmlFor="OPEN">운영중</label>&nbsp;
                                <input
                                    type="radio"
                                    name="hubStatus"
                                    id="PAUSED"
                                    value="PAUSED"
                                    checked={ hubData.hubStatus == "PAUSED" }
                                    onChange={ handleChange }/>
                                <label htmlFor="PAUSED">일시중단</label>&nbsp;
                                <input
                                    type="radio"
                                    name="hubStatus"
                                    id="CLOSE"
                                    value="CLOSE"
                                    checked={ hubData.hubStatus == "CLOSE" }
                                    onChange={ handleChange }/>
                                <label htmlFor="CLOSE">종료</label>
                            </td>
                            <th>유형</th>
                            <td colSpan="2">
                                <select
                                    className="custom-select"
                                    name="hubType"
                                    value={ hubData.hubType }
                                    onChange={ handleChange }>
                                    <option value="1">숙소</option>
                                    <option value="2">공유오피스</option>
                                </select>
                            </td>
                        </tr>
                        {/* 카카오 주소 검색 적용 영역 */}
                        <tr>
                            <th>주소</th>
                            <td colSpan="3">
                                <input
                                    type="text"
                                    name="hubAddress"
                                    className="form-control"
                                    placeholder="주소를 입력해주세요."
                                    value={ hubData.hubAddress }
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
                                        value={ hubData.mainRegion }
                                        readOnly
                                        required />
                                    <input
                                        className="form-control"
                                        name="subRegion"
                                        value={ hubData.subRegion }
                                        readOnly
                                        required />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>전화번호</th>
                            <td colSpan="5">
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    minLength="13"
                                    maxLength="13"
                                    placeholder="전화번호를 입력해주세요.(-포함)"
                                    value={ hubData.phone }
                                    onChange={ handleChange }
                                    onBlur={ handleBlur }
                                    required />
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
                                    value={ hubData.hubName }
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
                                    value={ hubData.description }
                                    onChange={ handleChange }
                                    onBlur={ handleBlur } >
                                </textarea>
                            </td>
                        </tr>
                        <tr>
                            <th>첨부 이미지</th>
                            <td colSpan="5">
                                <div className="d-flex" style={{ gap: "15px" }}>
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
                                                    <button 
                                                        type="button" 
                                                        onClick={(e) => handleRemoveImage(index, e)}
                                                        style={{ position: "absolute", top: "5px", right: "5px", backgroundColor: "rgba(0,0,0,0.65)", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", fontSize: "11px" }}>
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
                            <td className="input-group col-10">
                                <input
                                    type="number"
                                    name="price"
                                    className="form-control"
                                    placeholder="0"
                                    min="0"
                                    value={ hubData.price }
                                    onChange={ handleChange }
                                    onBlur={ handleBlur } />
                                &nbsp;<p>원</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 실제 파일 선택 입력을 담당하되 화면에는 보이지 않는 input (ref로 제어) */}
                <input
                    type="file"
                    accept="image/*"
                    ref={ upfileRef }
                    style={ { display : "none" } }
                    onChange={ handleFileChange }
                />
                <br />
               
                {/* 폼 제출 버튼 */}
                <button type="submit" className="btn btn-primary" onClick={ insertHub }>등록하기</button>
                {/* 이전 페이지 이동 버튼 */}
                <button type="button" className="back" onClick={ () => { navigate(-1); } }>뒤로가기</button>
            </form>
        </div>
    )
}

export default HubEnrollFormComponent;
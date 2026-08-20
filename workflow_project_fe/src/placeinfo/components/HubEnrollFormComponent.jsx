import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// 백엔드 통신 API 함수 및 스타일시트 임포트
import { insertHubApi } from "../api/placeinfoApi"
import "../styles/HubEnrollFormComponent.css";

function HubEnrollFormComponent() {

    // 1. 파일 관련 State
    const [file, setFile] = useState(null);       // 백엔드로 전송할 실제 File 객체 저장
    const [preview, setPreview] = useState(null); // 미리보기에 사용할 Base64 이미지 URL 저장

    // 2. 폼 입력값 통합 State 관리 (객체 형태)
    const [hubData, setHubData] = useState({ 
        regionName : "강원",
        hubName : "",
        hubAddress : "",
        phone : "",
        description : "",
        hubType : "1",
        pay : 0,
        intake : 1,
        use : "Y"
    });

    // 3. 폼 입력값 변경 공통 핸들러 (Computed Property Names 활용)
    const handleChange = e => {
        const newHubData = { ...hubData };
        // e.target.name에 지정된 속성명만 동적으로 업데이트
        newHubData[e.target.name] = e.target.value;
        setHubData(newHubData);
    } 

    // 페이지 이동을 위한 React Router Hook
    const navigate = useNavigate();

    // 숨겨진 <input type="file"> DOM 요소에 접근하기 위한 Ref Hook
    const upfileRef = useRef(null);

    // 카카오 주소 검색 팝업 호출 핸들러
    const handleAddressSearch = () => {

        new kakao.Postcode({
            oncomplete: (data) => {
                // 도로명 주소 표기 규칙에 따른 주소 조합
                let fullAddress = data.address;
                let extraAddress = "";

                // 법정동명 및 건물명 조합 (도로명 주소일 경우)
                if (data.addressType === "R") {
                    if (data.bname !== "") {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== "") {
                        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
                    }
                    fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
                }

                // hubData의 hubAddress 값 업데이트
                setHubData(prevData => ({
                    ...prevData,
                    hubAddress: fullAddress
                }));
            }
        }).open();
    };

    // 이미지 업로드 영역 클릭 시 실제 파일 입력창(input)을 트리거하는 함수
    const handleAreaClick = () => {
        if (upfileRef.current) {
            upfileRef.current.click();
        }
    };

    // 파일 유효성 검사 및 FileReader를 통한 미리보기 생성 공통 함수
    const processFile = (selectedFile) => {
        // 파일 선택이 취소된 경우 State 초기화
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            return;
        }

        // 이미지 파일 형식 검증 (image/png, image/jpeg 등)
        if (!selectedFile.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            return;
        }

        // FileReader API로 파일 읽기
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile); // 파일을 Data URL(Base64) 형태 스트링으로 읽음
        reader.onload = e => {
            setPreview(e.target.result); // 미리보기 URL 저장
            setFile(selectedFile);       // 실제 파일 객체 저장
        };
    };

    // <input type="file">을 통한 파일 선택 이벤트 핸들러
    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
    }

    // 드래그 요소가 영역 위에 올라왔을 때 브라우저 기본 동작(파일 열기) 방지
    const handleDragOver = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    // 드롭 영역에 파일을 떨어뜨렸을 때 처리하는 핸들러
    const handleDrop = e => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            processFile(droppedFiles[0]);
        }
    }

    // 서버로 거점 등록 데이터(FormData)를 전송하는 비동기 함수
    const insertHub = async e => {
        // 버튼 클릭 시 기본 submit 폼 제출 및 페이지 리로드 동작 방지
        e.preventDefault();

        try {
            let upFile = upfileRef.current;
            // 파일 업로드가 포함되므로 multipart/form-data 처리를 위한 FormData 객체 생성
            const formData = new FormData();

            // 폼 데이터를 키-값 쌍으로 추가
            formData.append("regionName", hubData.regionName);
            formData.append("hubName", hubData.hubName);
            formData.append("hubAddress", hubData.hubAddress);
            formData.append("phone", hubData.phone);
            formData.append("description", hubData.description);
            formData.append("hubType", hubData.hubType);
            formData.append("pay", hubData.pay);
            formData.append("intake", hubData.intake);
            formData.append("use", hubData.use);

            // 우선순위: ref 인풋에 직접 담긴 파일 > 드래그앤드롭 등으로 file state에 담긴 파일
            if (upFile && upFile.files.length > 0) {
                formData.append("upfile", upFile.files[0]);
            } else if (file) {
                formData.append("upfile", file);
            }

            // API 함수 호출 (Axios 등을 통한 POST 요청)
            const response = await insertHubApi(formData);

            // 서버 응답 결과 처리
            if(response.data == "success") {
                alert("거점 등록에 성공했습니다.");
                navigate("/hub/list"); // 성공 시 리스트 페이지로 이동
            } else {
                alert("거점 등록에 실패했습니다.");
            }

        } catch(error) {
            
            console.log("거점 등록용 ajax 통신 실패!");
        }
    }

    return(
        <div>
            <h2 align="center"><b>거점 등록</b></h2>
            <br />
            {/* 폼 제출 엔터 키 지원을 위해 onSubmit에 insertHub 연결 권장 */}
            <form onSubmit={insertHub}>
                <table width="100%">
                    <tbody>
                        <tr>
                            <th>사용 가능 인원</th>
                            <td className="input-group col-5">
                                {/* numeric 입력값 바인딩 */}
                                <input 
                                    type="number" 
                                    min="1" 
                                    className="form-control" 
                                    placeholder="0" 
                                    name="intake" 
                                    value={ hubData.intake } 
                                    onChange={ handleChange }
                                />&nbsp;<p>명</p>
                            </td>
                            <th>이용 가능 여부</th>
                            <td>
                                {/* Radio 버튼 바인딩 (checked 조건식 활용) */}
                                <input 
                                    type="radio" 
                                    name="use" 
                                    id="able" 
                                    value="Y" 
                                    checked={ hubData.use == "Y" } 
                                    onChange={ handleChange } 
                                />
                                <label htmlFor="able">가능</label>&nbsp;
                                <input 
                                    type="radio" 
                                    name="use" 
                                    id="unable" 
                                    value="N" 
                                    checked={ hubData.use == "N" } 
                                    onChange={ handleChange } 
                                />
                                <label htmlFor="unable">불가능</label>
                            </td>
                            <th>유형</th>
                            <td>
                                {/* Dropdown 셀렉트 박스 바인딩 */}
                                <select 
                                    className="form-control" 
                                    name="hubType" 
                                    value={ hubData.hubType } 
                                    onChange={ handleChange }
                                >
                                    <option value="1">숙소</option>
                                    <option value="2">공유오피스</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th>전화번호</th>
                            <td colSpan="3">
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    className="form-control" 
                                    minLength="13" 
                                    maxLength="13" 
                                    placeholder="전화번호를 입력해주세요.(-포함)" 
                                    value={ hubData.phone } 
                                    onChange={ handleChange } 
                                />
                            </td>
                            <th>지역</th>
                            <td>
                                <select 
                                    className="form-control" 
                                    name="regionName" 
                                    value={ hubData.regionName } 
                                    onChange={ handleChange }
                                >
                                    <option value="강원">강원</option>
                                    <option value="제주">제주</option>
                                    <option value="부산">부산</option>
                                </select>
                            </td>
                        </tr>
                        {/* 카카오 주소 검색 적용 영역 */}
                        <tr>
                            <th>주소</th>
                            <td colSpan="5">
                                <input 
                                    type="text" 
                                    name="hubAddress" 
                                    className="form-control" 
                                    placeholder="주소를 입력해주세요." 
                                    value={ hubData.hubAddress } 
                                    onClick={ handleAddressSearch }
                                />
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
                                />
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
                                ></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th>첨부 이미지</th>
                            <td colSpan="5">
                                {/* 커스텀 드래그 앤 드롭 및 클릭 업로드 영역 */}
                                <div 
                                    onClick={handleAreaClick}
                                    onDragEnter={handleDragOver}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    style={{ 
                                        width: "250px", 
                                        height: "170px", 
                                        cursor: "pointer" 
                                    }}
                                >
                                    {/* preview 존재 시 이미지 표시, 없을 시 안내 문구 영역 표시 */}
                                    {preview ? (
                                        <img 
                                            src={preview} 
                                            width="250" 
                                            height="170" 
                                            alt="첨부 이미지" 
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{ 
                                            width: "100%", 
                                            height: "100%", 
                                            border: "2px dashed #ccc", 
                                            display: "flex", 
                                            alignItems: "center", 
                                            justifyContent: "center",
                                            color: "#888",
                                            boxSizing: "border-box"
                                        }}>
                                            클릭하거나 이미지를 드래그하세요.
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th>가격/1일 기준<div style={{ fontSize : "12px" }}>숙소는 1박 기준!</div></th>
                            <td className="input-group col-10">
                                <input 
                                    type="number" 
                                    name="pay" 
                                    className="form-control" 
                                    placeholder="0" 
                                    min="0" 
                                    value={ hubData.pay } 
                                    onChange={ handleChange }
                                />&nbsp;<p>원</p>
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
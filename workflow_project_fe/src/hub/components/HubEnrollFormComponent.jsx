import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// 백엔드 통신 API 함수 및 스타일시트 임포트
import { insertHubApi } from "../api/hubApi"
import "../styles/Hub.css";

function HubEnrollFormComponent(props) {

    // 첨부 이미지 파일 객체 배열
    const [files, setFiles] = useState([null, null, null]);
    // 이미지 미리보기 Base64 URL 저장 배열
    const [previews, setPreviews] = useState([null, null, null]);
    // 현재 파일 선택/변경의 대상이 되는 영역 인덱스
    const [targetIndex, setTargetIndex] = useState(null);
    // 카카오 우편번호 API 사용을 위한 window 객체 내 kakao 추출
    const { kakao } = window;
    // 페이지 이동 처리를 위한 React Router Hook
    const navigate = useNavigate();
    // 숨겨진 실제 <input type="file"> 요소 조작을 위한 Ref
    const upfileRef = useRef(null);
    // <form> 요소의 유효성 검사 실행을 위한 Ref
    const formRef = useRef(null);
    // 폼 입력값 통합 State 관리
    const [hub, setHub] = useState({
        mainRegion : "",
        subRegion : "",
        hubName : "",
        hubAddress : "",
        phone : "",
        description : "",
        hubType : 1,
        price : "",
        maxCapacity : "",
        hubStatus : "OPEN"
    });
    // 로그인한 사용자 정보 불러오기
    const loginUser = props.loginUser;

    // 폼 입력값 변경 공통 핸들러
    const handleChange = e => {
        const newHub = { ...hub };
        // e.target.name에 지정된 속성명만 동적으로 업데이트
        newHub[e.target.name] = e.target.value;
        setHub(newHub);
    }

    // 폼 입력값 양옆 공백 삭제 핸들러
    const handleBlur = e => {
        const newHub = { ...hub };

        newHub[e.target.name] = e.target.value.trim();
        setHub(newHub);
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

    // 첨부된 파일 검증 및 미리보기 URL 생성 처리 함수
    const processAndSetFile = (file, index) => {
        // 이미지 Mime-Type 검증
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 첨부 가능합니다.");
            return;
        }

        // FileReader를 이용한 이미지 데이터 읽기
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = e => {
            const newPreview = e.target.result;
            
            // 원본 파일 객체 배열 업데이트
            setFiles(prev => {
                const next = [...prev];
                next[index] = file;
                return next;
            });
            // 미리보기 URL 배열 업데이트
            setPreviews(prev => {
                const next = [...prev];
                next[index] = newPreview;
                return next;
            });
        };
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

    // 특정 위치의 첨부 이미지 및 미리보기 삭제
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
    };

    // 등록 폼 데이터를 Multipart/FormData 형태로 구성하여 백엔드 서버로 비동기 전송
    const insertHub = async e => {
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
                formData.append(key, hub[key]);
            });

            // 새로 추가된 파일 객체만 필터링하여 FormData에 append
            files.filter(f => f !== null).forEach(f => {
                formData.append("upfile", f);
            });

            // API 함수 호출
            const response = await insertHubApi(formData);

            // 서버 응답 결과 처리
            if(response.data === "success") {
                alert("거점 등록에 성공했습니다.");
                navigate("/hub/list");
            } else {
                alert("거점 등록에 실패했습니다.");
            }

        } catch(error) {
            // 파일 용량 초과 에러 예외 처리
           if(error.response && error.response.status === 413) {
                alert("이미지의 용량이 너무 큽니다. 파일 크기를 줄여서 다시 시도해주세요.")
           } else {
                console.log(error);
           }    
        }
    };

    // return 구문
    return(
        <div className="content">
            { (loginUser.authCode === "ADMIN") ? (
                <>
                    <h2 align="center"><b>거점 등록</b></h2>
                    <br />
                    {/* 거점 작성 입력 폼 */}
                    <form ref={formRef}>
                        <table width="100%">
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
                                            required
                                            readOnly/>
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
                                {/* 전화번호, 거점 유형 */}
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
                                                    {/* 미리보기 이미지 유무에 따른 조건부 렌더링 */}
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
                        <button type="submit" className="btn btn-primary" onClick={ insertHub }>등록하기</button>
                        <button type="button" className="btn btn-dark" style={ { float : "right", borderRadius : "99px" } }  onClick={ () => { navigate(-1); } }>뒤로가기</button>
                    </form>
                </>
            ) : (
                <h2 align="center"><b>해당 페이지는 관리자만 올 수 있습니다.</b></h2>
            ) }
        </div>
    )
}

export default HubEnrollFormComponent;
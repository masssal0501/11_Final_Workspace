import { useNavigate } from "react-router-dom";
import { useState } from "react";

// 백엔드 AI 메시지 전송 API 함수 및 전용 CSS 임포트
import { sendMessageApi } from "../api/placeinfoApi";
import "../styles/AIComponent.css";

function AIComponent() {

    // 라우팅 관련 훅 (뒤로가기 등 페이지 이동 시 사용)
    const navigate = useNavigate();

    // 사용자가 입력창에 작성 중인 메시지 텍스트 State
    const [inputMessage, setInputMessage] = useState("");

    // 채팅 대화 목록을 저장하는 배열 State (객체 배열: [{ sender: "나", text: "..." }, ...])
    const [messages, setMessages] = useState([]);

    // 입력창(input) 바인딩 핸들러 - 사용자가 글자를 입력할 때마다 inputMessage State 갱신
    const handleChange = e => {
        setInputMessage(e.target.value);
    };

    // AI 채팅 요청 전송 핸들러 (비동기 처리)
    const Chatting = async e => {

        // 폼 제출 시 페이지 전체가 새로고침되는 기본 브라우저 동작 방지
        e.preventDefault();

        document.getElementById("messageInput").disabled = true;
        document.getElementById("confirm").disabled = true;

        // 입력값의 앞뒤 공백을 제거했을 때 빈 문자열이면 전송하지 않고 종료 (공백 입력 방지)
        if (inputMessage.trim().length === 0) {
            return;
        }

        // 현재 입력된 메시지를 별도 변수에 저장 (setInputMessage("")로 초기화되기 전 값 보존)
        const userText = inputMessage;

        // 사용자 메시지를 대화 목록 배열에 즉시 추가 (화면에 사용자 말풍선 먼저 렌더링)
        // 이전 State(prev)를 복사하여 새로운 객체를 배열 끝에 합침
        setMessages(prev => [...prev, { sender: "나", text: userText }]);

        // 입력창 비우기
        setInputMessage("");
        
        try {
            // 백엔드 AI API 서버로 사용자 메시지 전달 (비동기 응답 대기)
            const response = await sendMessageApi(userText);

            // AI 응답 수신 성공 시 AI 메시지를 대화 목록 배열에 추가
            // Functional Update(prev => ...)를 활용해 최신 messages 상태를 안전하게 참조
            setMessages((prev) => [...prev, { sender: "AI", text: response.data }]);
            document.getElementById("messageInput").disabled = false;
            document.getElementById("confirm").disabled = false;
        } catch (error) {
            // AJAX 통신 예외 발생 시 에러 로그 출력
            console.log("AI 요청용 ajax 통신 실패!", error);
        }
    };

    return (
        <div className="content">
            {/* 페이지 타이틀 */}
            <h2 align="center"><b>AI 추천</b></h2>

            <hr />
            <br />

            {/* 채팅 메시지 출력 영역 */}
            <div id="chatMessages">
                {/* messages 배열을 순회하며 메시지 목록을 화면에 출력 */}
                {messages.map((msg, index) => (
                    /* 
                       whiteSpace: "pre-line" 속성을 부여하여 
                       AI 응답 텍스트에 포함된 줄바꿈 문자(\n)가 화면에 그대로 적용되도록 설정 
                    */
                    <p key={index} style={{ whiteSpace: "pre-line" }}>
                        <b>{msg.sender} : </b>{msg.text}
                    </p>
                ))}
            </div>

            <br />

            {/* 입력 폼 영역 */}
            <form align="center" className="col-7 ai-form">
                {/* 메시지 입력창 */}
                <input 
                    type="text" 
                    id="messageInput" 
                    className="form-control"  
                    placeholder="AI에게 물어보기" 
                    value={inputMessage} 
                    onChange={handleChange} 
                />
                
                {/* 전송 버튼 */}
                <button type="submit" className="confirm" id="confirm" onClick={ Chatting }>
                    확인
                </button>
                <button type="button" className="back" onClick={() => { navigate(-1); }}>
                    뒤로가기
                </button>
            </form>
        </div>
    );
}

export default AIComponent;
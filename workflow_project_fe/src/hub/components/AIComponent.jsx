import { useNavigate } from "react-router-dom";
import { useState } from "react";

// API 통신 함수 및 전용 CSS 임포트
import { sendMessageApi } from "../api/hubApi";
import "../styles/Hub.css";

/**
 * AI 기반 채팅 컴포넌트
 * 사용자의 질문을 입력받아 AI 서버와 통신하고, 대화 내용을 화면에 렌더링합니다.
 */
function AIComponent() {

    // 페이지 이동을 위한 라우터 훅 (뒤로가기 등)
    const navigate = useNavigate();

    // 사용자 입력 메시지 상태 관리
    const [inputMessage, setInputMessage] = useState("");

    // 채팅 대화 기록 상태 관리 (형식: [{ sender: "나" | "AI", text: "메시지 내용" }])
    const [messages, setMessages] = useState([]);

    /**
     * 텍스트 입력 이벤트 핸들러
     */
    const handleChange = e => {
        setInputMessage(e.target.value);
    };

    /**
     * 메시지 전송 및 AI 응답 처리 (비동기)
     * @param {Event} e - 폼 제출 이벤트 객체
     */
    const Chatting = async e => {
        // 폼 제출에 의한 브라우저 기본 새로고침 방지
        e.preventDefault();

        // 중복 전송 방지를 위해 입력창 및 확인 버튼 비활성화 (DOM 직접 제어)
        document.getElementById("messageInput").disabled = true;
        document.getElementById("confirm").disabled = true;

        // 공백만 입력되었거나 비어있을 경우 전송 중단
        if (inputMessage.trim().length === 0) {
            document.getElementById("messageInput").disabled = false;
            document.getElementById("confirm").disabled = false;
            return;
        }

        // 현재 입력값을 보존하고 UI 입력창은 즉시 초기화
        const userText = inputMessage;
        setInputMessage("");

        // 사용자 메시지를 대화 기록에 추가 (화면에 먼저 렌더링)
        setMessages(prev => [...prev, { sender: "나", text: userText }]);

        try {
            // 서버로 메시지 전송 및 응답 대기
            const response = await sendMessageApi(userText);

            // 성공 시 AI 응답 메시지를 대화 기록에 추가
            setMessages((prev) => [...prev, { sender: "AI", text: response.data }]);

            // 에러 발생 시에도 다시 입력할 수 있도록 활성화 복구 처리 추가
            document.getElementById("messageInput").disabled = false;
            document.getElementById("confirm").disabled = false;
        } catch (error) {
            // AJAX 통신 예외 발생 시 에러 로그 출력
            console.error(error);
        }
    };

    return (
        <div className="hub-content">
            {/* 타이틀 영역 */}
            <h2 align="center" className="hub-header"><b>AI 추천</b></h2>
            <hr />
            <br />

            {/* 대화 내용 출력 영역 */}
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

            {/* 메시지 입력 폼 */}
            <form align="center" className="col-7 ai-form">
                <input 
                    type="text" 
                    id="messageInput" 
                    className="form-control"  
                    placeholder="AI에게 물어보기" 
                    value={inputMessage} 
                    onChange={handleChange} 
                />

                <button type="submit" className="confirm" id="confirm" onClick={ Chatting }>
                    확인
                </button>
                <button type="button" style={ { float : "right", borderRadius : "99px" } } className="btn btn-dark" onClick={() => { navigate(-1); }}>
                    뒤로가기
                </button>
            </form>
        </div>
    );
}

export default AIComponent;
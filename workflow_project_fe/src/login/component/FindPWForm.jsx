import { Link } from "react-router-dom";
import "../styles/LoginForm.css";

function FindPWForm() {

    return(
        <div className="loginForm">
            <div className="subtitle">비밀번호 찾기</div>
            아이디 : <input type="text" /> <br />
            사번 : <input type="text" /> <br />
            이메일 : <input type="email" /> <br />
            
            <button>비밀번호 재설정</button> <br />
            <Link to="/login">로그인</Link> / <Link to="/login/findID">아이디 찾기</Link>
        </div>
    )
}

export default FindPWForm;


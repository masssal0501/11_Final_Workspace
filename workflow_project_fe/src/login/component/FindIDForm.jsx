import { Link } from "react-router-dom";
import "../styles/LoginForm.css";

function FindIDForm() {

    return(
        <div className="loginForm">
            <div className="subtitle">아이디 찾기</div>
            이름 : <input type="text" /> <br />
            사번 : <input type="text" /> <br />
            이메일 : <input type="email" /> <br />
            <button>확인</button> <br />
            <Link to="/login">로그인</Link> / <Link to="/login/findPW">비밀번호 찾기</Link>
        </div>
    )
}

export default FindIDForm;


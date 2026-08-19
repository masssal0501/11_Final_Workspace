import { Link } from "react-router-dom";
import "../styles/LoginForm.css";

function LoginForm() {

    return(
        <div className="loginForm">
            <div className="subtitle">로그인</div>
            아이디 : <input type="text" /> <br />
            비밀번호 : <input type="password" /> <br />
            <input type="checkbox" /> 아이디 저장 <br />
            <button>로그인</button> <br />
            <Link to="findID">아이디 찾기</Link> / <Link to="findPW">비밀번호 찾기</Link>
        </div>
    )
}

export default LoginForm;


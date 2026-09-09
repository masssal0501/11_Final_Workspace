import "../styles/ErrorPage.css";
import { useNavigate } from "react-router-dom";


function ErrorPage() {
    const navigate = useNavigate();

    // 이전 페이지로 이동
    const handleGoBack = () => {
        navigate(-1);
    };

    // 대시보드로 이동
    // BUG: "/dashboard" 라우트는 App.jsx에 존재하지 않는다(대시보드는 "/" 경로에서
    // authCode에 따라 Admin/Manager/StaffComponent를 조건부 렌더링하는 구조).
    // 기존 코드대로면 "홈으로" 버튼을 눌러도 다시 잘못된 경로("/dashboard")로 이동해
    // 이 에러 페이지로 되돌아오는 루프가 발생했다.
    const handleGoDashboard = () => {
        navigate("/");
    };

    return (
        <div className="error-page">
            <div className="error-container">
                <div className="error-icon">
                    !
                </div>

                <h1>ERROR</h1>

                <p>
                    접속권한이 없거나 잘못된 경로입니다.
                </p>

                <div className="error-buttons">
                    <button
                        className="error-back-btn"
                        onClick={handleGoBack}
                    >
                        이전 페이지
                    </button>

                    <button
                        className="error-dashboard-btn"
                        onClick={handleGoDashboard}
                    >
                        홈으로
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;


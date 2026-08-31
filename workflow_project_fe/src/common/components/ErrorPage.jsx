import "../styles/ErrorPage.css";
import { useNavigate } from "react-router-dom";


function ErrorPage() {
    const navigate = useNavigate();

    // 이전 페이지로 이동
    const handleGoBack = () => {
        navigate(-1);
    };

    // 대시보드로 이동
    const handleGoDashboard = () => {
        navigate("/dashboard");
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


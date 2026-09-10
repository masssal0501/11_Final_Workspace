import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getReviewStatus, getReview, submitReview } from "../api/reviewApi";

import "../styles/Review.css";

// 로컬 개발 기본값(운영 빌드는 VITE_API_BASE_URL=/workflow로 주입되어 상대경로로 동작함)
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8006/workflow";

function WorkcationReviewForm() {

    const { workcationNo } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState(null);
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        Promise.all([
            getReviewStatus(workcationNo),
            getReview(workcationNo)
        ])
            .then(([statusResult, reviewResult]) => {
                setStatus(statusResult);
                setExistingReview(reviewResult);
            })
            .catch(err => {
                console.error("후기 정보 조회 실패:", err);
                alert("후기 정보를 불러오지 못했습니다.");
            })
            .finally(() => setLoading(false));
    }, [workcationNo]);

    const handleSubmit = async () => {

        if (rating < 1) {
            alert("별점을 선택해주세요.");
            return;
        }

        if (!content.trim()) {
            alert("후기 내용을 입력해주세요.");
            return;
        }

        if (!window.confirm("후기를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.")) {
            return;
        }

        try {
            await submitReview(workcationNo, rating, content.trim(), photo);
            alert("후기가 등록되었습니다. 소중한 의견 감사합니다.");
            navigate(`/workcation/mydetail/${workcationNo}`);
        } catch (err) {
            console.error("후기 제출 실패:", err);
            alert(err?.response?.data?.message || "후기 제출 중 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return (
            <main className="wf-container">
                <div className="review-container">
                    <div className="wf-state">
                        <div className="wf-spinner" />
                        <div className="wf-state-title">후기 정보를 불러오는 중입니다.</div>
                    </div>
                </div>
            </main>
        );
    }

    // 이미 작성한 후기가 있으면 읽기 전용으로 보여준다
    if (existingReview) {
        return (
            <main className="wf-container">
                <div className="review-container">
                    <section className="wf-page-header">
                        <div>
                            <h1 className="wf-page-title">내가 작성한 후기</h1>
                        </div>
                    </section>

                    <div className="review-view-box">
                        <div className="review-star-display">
                            {"★".repeat(existingReview.rating)}{"☆".repeat(5 - existingReview.rating)}
                        </div>
                        <p className="review-content-display">{existingReview.content}</p>
                        {existingReview.photoPath && (
                            <img
                                className="review-photo-display"
                                src={`${API_BASE_URL}${existingReview.photoPath}`}
                                alt="후기 사진"
                            />
                        )}
                    </div>

                    <div className="review-btn-group">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(`/workcation/mydetail/${workcationNo}`)}>
                            돌아가기
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!status?.available) {
        return (
            <main className="wf-container">
                <div className="review-container">
                    <section className="wf-page-header">
                        <div>
                            <h1 className="wf-page-title">워케이션 후기</h1>
                        </div>
                    </section>
                    <div className="review-message-box">
                        {status?.message || "지금은 후기를 작성할 수 없습니다."}
                    </div>
                    <div className="review-btn-group">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(`/workcation/mydetail/${workcationNo}`)}>
                            돌아가기
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="wf-container">
        <div className="review-container">

            <section className="wf-page-header">
                <div>
                    <h1 className="wf-page-title">워케이션 후기</h1>
                    <p className="wf-page-description">워케이션은 어떠셨나요? 별점과 후기를 남겨주세요.</p>
                </div>
            </section>

            <div className="review-question-box">
                <span className="review-question-label">별점</span>
                <div className="review-star-group">
                    {[1, 2, 3, 4, 5].map(score => (
                        <button
                            type="button"
                            key={score}
                            className={"review-star-btn" + (score <= rating ? " selected" : "")}
                            onClick={() => setRating(score)}
                            aria-label={`별점 ${score}점`}
                        >
                            {score <= rating ? "★" : "☆"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="review-question-box">
                <span className="review-question-label">후기 내용</span>
                <textarea
                    className="review-textarea"
                    placeholder="워케이션 경험을 자유롭게 작성해주세요."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            <div className="review-question-box">
                <span className="review-question-label">사진(선택)</span>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={e => setPhoto(e.target.files[0] || null)}
                />
            </div>

            <div className="review-btn-group">
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/workcation/mydetail/${workcationNo}`)}>
                    취소
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                    제출하기
                </button>
            </div>
        </div>
        </main>
    );
}

export default WorkcationReviewForm;

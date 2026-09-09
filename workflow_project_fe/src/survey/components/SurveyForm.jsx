import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getSurveyQuestions, getSurveyStatus, submitSurvey } from "../api/surveyApi";

import "../styles/Survey.css";

function SurveyForm() {

    const { workcationNo } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [status, setStatus] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getSurveyQuestions(),
            getSurveyStatus(workcationNo)
        ])
            .then(([questionList, statusResult]) => {
                setQuestions(questionList);
                setStatus(statusResult);
            })
            .catch(err => {
                console.error("만족도 조사 정보 조회 실패:", err);
                alert("만족도 조사 정보를 불러오지 못했습니다.");
            })
            .finally(() => setLoading(false));
    }, [workcationNo]);

    const handleScoreChange = (questionNo, score) => {
        setAnswers(prev => ({
            ...prev,
            [questionNo]: { questionNo, score }
        }));
    };

    const handleTextChange = (questionNo, answerValue) => {
        setAnswers(prev => ({
            ...prev,
            [questionNo]: { questionNo, answerValue }
        }));
    };

    const handleSubmit = async () => {

        for (const question of questions) {
            const answer = answers[question.questionNo];

            if (question.questionType === "SCORE" && !answer?.score) {
                alert(`"${question.questionContent}" 항목의 평점을 선택해주세요.`);
                return;
            }

            if (question.questionType === "TEXT" && !answer?.answerValue?.trim()) {
                alert(`"${question.questionContent}" 항목을 입력해주세요.`);
                return;
            }
        }

        if (!window.confirm("만족도 조사를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.")) {
            return;
        }

        try {
            await submitSurvey(workcationNo, questions.map(q => answers[q.questionNo]));
            alert("만족도 조사가 제출되었습니다. 소중한 의견 감사합니다.");
            navigate(`/workcation/mydetail/${workcationNo}`);
        } catch (err) {
            console.error("만족도 조사 제출 실패:", err);
            alert(err?.response?.data?.message || "만족도 조사 제출 중 오류가 발생했습니다.");
        }
    };

    if (loading) {
        return (
            <div className="survey-container">
                <h2 align="center">워케이션 만족도 조사</h2>
            </div>
        );
    }

    if (!status?.available) {
        return (
            <div className="survey-container">
                <h2 align="center">워케이션 만족도 조사</h2>
                <div className="survey-message-box">
                    {status?.message || "지금은 만족도 조사를 작성할 수 없습니다."}
                </div>
                <div className="survey-btn-group">
                    <button type="button" onClick={() => navigate(`/workcation/mydetail/${workcationNo}`)}>
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="survey-container">
            <h2 align="center">워케이션 만족도 조사</h2>

            {questions.map(question => (
                <div className="survey-question-box" key={question.questionNo}>
                    <span className="survey-question-label">{question.questionContent}</span>

                    {question.questionType === "SCORE" ? (
                        <div className="survey-score-group">
                            {[1, 2, 3, 4, 5].map(score => (
                                <button
                                    type="button"
                                    key={score}
                                    className={
                                        "survey-score-btn" +
                                        (answers[question.questionNo]?.score === score ? " selected" : "")
                                    }
                                    onClick={() => handleScoreChange(question.questionNo, score)}
                                >
                                    {score}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            className="survey-textarea"
                            placeholder="의견을 자유롭게 작성해주세요."
                            value={answers[question.questionNo]?.answerValue || ""}
                            onChange={e => handleTextChange(question.questionNo, e.target.value)}
                        />
                    )}
                </div>
            ))}

            <div className="survey-btn-group">
                <button type="button" onClick={() => navigate(`/workcation/mydetail/${workcationNo}`)}>
                    취소
                </button>
                <button type="button" onClick={handleSubmit}>
                    제출하기
                </button>
            </div>
        </div>
    );
}

export default SurveyForm;

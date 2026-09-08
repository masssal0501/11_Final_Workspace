import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeInsert() {

    const navigate = useNavigate();

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeStatus, setNoticeStatus] = useState('VISIBLE');

    const [files, setFiles] = useState([]);

    const [loading, setLoading] = useState(false);


    // =========================================================
    // 관리자 권한 확인
    // =========================================================

    useEffect(() => {

        const loginUser =
            JSON.parse(
                localStorage.getItem('user')
            );

        if (loginUser?.authCode !== 'ADMIN') {

            alert(
                '관리자만 공지사항을 등록할 수 있습니다.'
            );

            navigate('/notice');

        }

    }, [navigate]);


    // =========================================================
    // 제목
    // =========================================================

    const handleTitleChange = (e) => {

        setNoticeTitle(e.target.value);

    };


    // =========================================================
    // 내용
    // =========================================================

    const handleContentChange = (e) => {

        setNoticeContent(e.target.value);

    };


    // =========================================================
    // 공지 상태
    // =========================================================

    const handleStatusChange = (e) => {

        setNoticeStatus(e.target.value);

    };


    // =========================================================
    // 파일 선택
    // =========================================================

    const handleFileChange = (e) => {

        const selectedFiles =
            Array.from(e.target.files);

        setFiles(selectedFiles);

    };


    // =========================================================
    // 파일 제거
    // =========================================================

    const handleRemoveFile = (index) => {

        setFiles(prev =>
            prev.filter((_, i) => i !== index)
        );

    };


    // =========================================================
    // 등록
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (loading) {
            return;
        }


        // =====================================================
        // 관리자 확인
        // =====================================================

        const loginUser =
            JSON.parse(
                localStorage.getItem('user')
            );

        if (loginUser?.authCode !== 'ADMIN') {

            alert(
                '관리자만 공지사항을 등록할 수 있습니다.'
            );

            navigate('/notice');

            return;

        }


        // =====================================================
        // 제목 검증
        // =====================================================

        if (!noticeTitle.trim()) {

            alert(
                '공지사항 제목을 입력해주세요.'
            );

            return;

        }


        // =====================================================
        // 내용 검증
        // =====================================================

        if (!noticeContent.trim()) {

            alert(
                '공지사항 내용을 입력해주세요.'
            );

            return;

        }


        try {

            setLoading(true);


            // =================================================
            // FormData
            // =================================================

            const formData =
                new FormData();


            // =================================================
            // Notice 객체
            // =================================================

            const notice = {

                noticeTitle:
                    noticeTitle.trim(),

                noticeContent:
                    noticeContent,

                noticeStatus:
                    noticeStatus

            };


            // =================================================
            // JSON Blob
            // =================================================

            formData.append(

                'notice',

                new Blob(
                    [
                        JSON.stringify(
                            notice
                        )
                    ],
                    {
                        type:
                            'application/json'
                    }
                )

            );


            // =================================================
            // 첨부파일
            // =================================================

            files.forEach((file) => {

                formData.append(
                    'files',
                    file
                );

            });


            console.log(
                '공지사항 등록 요청:',
                notice
            );

            console.log(
                '첨부파일:',
                files
            );


            // =================================================
            // API 호출
            // =================================================

            await noticeApi.insertNotice(
                formData
            );


            alert(
                '공지사항이 등록되었습니다.'
            );


            // =================================================
            // 관리자 공지사항 목록
            // =================================================

            navigate(
                '/notice'
            );


        } catch (error) {

            console.error(
                '공지사항 등록 실패:',
                error
            );


            if (error.response) {

                console.error(
                    '서버 응답:',
                    error.response.data
                );

                console.error(
                    '상태 코드:',
                    error.response.status
                );

            }


            alert(
                error.response?.data?.message ||
                '공지사항 등록에 실패했습니다.'
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // 취소
    // =========================================================

    const handleCancel = () => {

        if (
            noticeTitle.trim() ||
            noticeContent.trim() ||
            files.length > 0
        ) {

            const result =
                window.confirm(
                    '작성 중인 내용이 있습니다.\n' +
                    '정말 취소하시겠습니까?'
                );

            if (!result) {
                return;
            }

        }


        navigate(
            '/notice'
        );

    };


    // =========================================================
    // 화면
    // =========================================================

    return (

        <div className="notice-container">

            <div className="notice-header">

                <h2>
                    공지사항 등록
                </h2>

            </div>


            <form
                className="notice-form"
                onSubmit={handleSubmit}
            >


                {/* =================================================
                    제목
                ================================================= */}

                <div className="notice-form-row">

                    <label htmlFor="noticeTitle">
                        제목
                    </label>

                    <input
                        id="noticeTitle"
                        type="text"
                        value={noticeTitle}
                        onChange={
                            handleTitleChange
                        }
                        placeholder="공지사항 제목을 입력해주세요."
                        maxLength={200}
                        disabled={loading}
                    />

                </div>


                {/* =================================================
                    상태
                ================================================= */}

                <div className="notice-form-row">

                    <label htmlFor="noticeStatus">
                        공지 상태
                    </label>

                    <select
                        id="noticeStatus"
                        value={noticeStatus}
                        onChange={
                            handleStatusChange
                        }
                        disabled={loading}
                    >

                        <option value="VISIBLE">
                            일반
                        </option>

                        <option value="IMPORTANT">
                            중요
                        </option>

                        <option value="UNVISIBLE">
                            비공개
                        </option>

                    </select>

                </div>


                {/* =================================================
                    내용
                ================================================= */}

                <div
                    className="notice-form-row notice-content-row"
                >

                    <label htmlFor="noticeContent">
                        내용
                    </label>

                    <textarea
                        id="noticeContent"
                        value={noticeContent}
                        onChange={
                            handleContentChange
                        }
                        placeholder="공지사항 내용을 입력해주세요."
                        rows={15}
                        disabled={loading}
                    />

                </div>


                {/* =================================================
                    첨부파일
                ================================================= */}

                <div className="notice-form-row">

                    <label htmlFor="noticeFiles">
                        첨부파일
                    </label>

                    <div className="notice-file-input-area">

                        <input
                            id="noticeFiles"
                            type="file"
                            multiple
                            onChange={
                                handleFileChange
                            }
                            disabled={loading}
                        />


                        {
                            files.length > 0 && (

                                <div
                                    className="notice-selected-files"
                                >

                                    {
                                        files.map(
                                            (
                                                file,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        `${file.name}-${index}`
                                                    }
                                                    className="notice-selected-file"
                                                >

                                                    <span>
                                                        📎 {
                                                            file.name
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveFile(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            loading
                                                        }
                                                    >
                                                        삭제
                                                    </button>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }

                    </div>

                </div>


                {/* =================================================
                    버튼
                ================================================= */}

                <div
                    className="notice-form-buttons"
                >

                    <button
                        type="button"
                        className="notice-btn"
                        onClick={
                            handleCancel
                        }
                        disabled={loading}
                    >
                        취소
                    </button>


                    <button
                        type="submit"
                        className="notice-btn primary"
                        disabled={loading}
                    >

                        {
                            loading
                                ? '등록 중...'
                                : '등록'
                        }

                    </button>

                </div>

            </form>

        </div>

    );

}

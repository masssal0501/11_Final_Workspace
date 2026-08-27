import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeDetail() {

    const { noticeNo } = useParams();
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);


    // =========================================================
    // 공지사항 상세 조회
    // =========================================================
    const fetchNoticeDetail = async () => {

        try {

            setLoading(true);

            const data =
                await noticeApi.getNoticeDetail(noticeNo);

            console.log(
                '공지사항 상세:',
                data
            );

            setNotice(data);

        } catch (error) {

            console.error(
                '공지사항 상세 조회 실패:',
                error
            );

            alert(
                '공지사항을 불러오지 못했습니다.'
            );

            navigate('/notice');

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        if (noticeNo) {
            fetchNoticeDetail();
        }

    }, [noticeNo]);


    // =========================================================
    // 날짜 포맷
    // =========================================================
    const formatDate = (date) => {

        if (!date) {
            return '-';
        }

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return '-';
        }

        return d.toLocaleDateString('ko-KR');

    };


    // =========================================================
    // 로딩
    // =========================================================
    if (loading) {

        return (

            <div className="notice-detail-container">

                <div className="notice-detail-loading">
                    공지사항을 불러오는 중입니다.
                </div>

            </div>

        );

    }


    // =========================================================
    // 데이터 없음
    // =========================================================
    if (!notice) {

        return (

            <div className="notice-detail-container">

                <div className="notice-detail-error">
                    존재하지 않는 공지사항입니다.
                </div>

            </div>

        );

    }


    return (

        <div className="notice-detail-container">

            <div className="notice-detail">


                {/* =================================================
                    제목 / 기본 정보
                ================================================= */}

                <div className="notice-detail-header">

                    <h2 className="notice-detail-title">

                        {notice.noticeStatus === 'IMPORTANT' && (

                            <span className="notice-detail-important">
                                중요
                            </span>

                        )}

                        {notice.noticeTitle}

                    </h2>


                    <div className="notice-detail-info">

                        <span>
                            작성자 : {notice.empName || '-'}
                        </span>

                        <span>
                            작성일 : {formatDate(
                                notice.createdAt
                            )}
                        </span>

                        <span>
                            조회수 : {notice.viewCount ?? 0}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    본문
                ================================================= */}

                <div
                    className="notice-detail-content"
                    dangerouslySetInnerHTML={{
                        __html: notice.noticeContent
                    }}
                />


                {/* =================================================
                    첨부파일
                ================================================= */}

                {
                    notice.fileList &&
                    notice.fileList.length > 0 && (

                        <div className="notice-detail-file-area">

                            <div className="notice-detail-file-title">
                                첨부파일
                            </div>


                            {
                                notice.fileList.map(
                                    (file) => (

                                        <div
                                            key={
                                                file.noticefileNo
                                            }
                                            className="notice-detail-file"
                                        >

                                            <span>
                                                📎
                                            </span>

                                            {notice.fileList &&
 notice.fileList.length > 0 && (

    <div className="notice-file-area">

        <h4>첨부파일</h4>

        {notice.fileList.map((file) => (

            <div
                key={file.noticefileNo}
                className="notice-file"
            >

                <a
                    href={
                        noticeApi.getFileDownloadUrl(
                            file.noticefileNo
                        )
                    }
                >
                    📎 {file.originName}
                </a>

            </div>

        ))}

    </div>
)}

                                        </div>

                                    )
                                )
                            }

                        </div>

                    )
                }


                {/* =================================================
                    버튼
                ================================================= */}

                <div className="notice-detail-buttons">

                    <button
                        type="button"
                        className="btn-list"
                        onClick={() =>
                            navigate('/notice')
                        }
                    >
                        목록
                    </button>

                </div>


            </div>

        </div>

    );

}
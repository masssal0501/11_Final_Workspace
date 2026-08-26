import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeList() {

    const navigate = useNavigate();

    const [noticeList, setNoticeList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNoticeList = async () => {

    try {

        setLoading(true);

        const data = await noticeApi.getNoticeList();

        console.log('공지사항 목록:', data);
        console.log('공지사항 배열:', data?.list);

        setNoticeList(
            Array.isArray(data?.list)
                ? data.list
                : []
        );

    } catch (error) {

        console.error(
            '공지사항 목록 조회 실패:',
            error
        );

        setNoticeList([]);

    } finally {

        setLoading(false);

    }
};

    useEffect(() => {
        fetchNoticeList();
    }, []);

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

    if (loading) {

        return (
            <div className="notice-container">
                <div className="notice-loading">
                    공지사항을 불러오는 중입니다.
                </div>
            </div>
        );

    }

    return (

        <div className="notice-container">

            <div className="notice-header">

                <h2>공지사항</h2>

            </div>


            <table className="notice-table">

                <thead>

                    <tr>

                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>

                    </tr>

                </thead>

                <tbody>

                    {
                        noticeList.length === 0

                        ?

                        <tr>

                            <td
                                colSpan="5"
                                className="notice-empty"
                            >
                                등록된 공지사항이 없습니다.
                            </td>

                        </tr>

                        :

                        noticeList.map((notice) => (

                            <tr
                                key={notice.noticeNo}
                                onClick={() =>
                                    navigate(
                                        `/notice/${notice.noticeNo}`
                                    )
                                }
                                className="notice-row"
                            >

                                <td>
                                    {notice.noticeNo}
                                </td>

                                <td className="notice-title-cell">

                                    {
                                        notice.noticeStatus ===
                                        'IMPORTANT' && (
                                            <span className="notice-important">
                                                중요
                                            </span>
                                        )
                                    }

                                    {notice.noticeTitle}

                                </td>

                                <td>
                                    {notice.empName || '-'}
                                </td>

                                <td>
                                    {formatDate(
                                        notice.createdAt
                                    )}
                                </td>

                                <td>
                                    {notice.viewCount ?? 0}
                                </td>

                            </tr>

                        ))
                    }

                </tbody>

            </table>

        </div>

    );
}
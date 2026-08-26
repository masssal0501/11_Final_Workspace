import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import '../styles/Notice.css';

export default function NoticeAdminList() {

    const navigate = useNavigate();

    const [noticeList, setNoticeList] = useState([]);

    const fetchList = async () => {

    try {

        const data =
            await noticeApi.getNoticeList();

        console.log('관리자 공지사항 목록:', data);
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

    }

};


    useEffect(() => {
        fetchList();
    }, []);


    const handleDelete = async (
        e,
        noticeNo
    ) => {

        e.stopPropagation();

        if (
            !window.confirm(
                '이 공지사항을 삭제하시겠습니까?'
            )
        ) {
            return;
        }

        try {

            await noticeApi.deleteNotice(
                noticeNo
            );

            alert(
                '삭제되었습니다.'
            );

            fetchList();

        } catch (error) {

            console.error(
                '공지사항 삭제 실패:',
                error
            );

            alert(
                '삭제에 실패했습니다.'
            );

        }

    };


    return (

        <div className="notice-container">

            <div className="notice-header">

                <h2>
                    공지사항 관리
                </h2>

                <button
                    type="button"
                    className="notice-btn primary"
                    onClick={() =>
                        navigate(
                            '/admin/notice/insert'
                        )
                    }
                >
                    공지사항 등록
                </button>

            </div>


            <table className="notice-table">

                <thead>

                    <tr>

                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                        <th>조회수</th>
                        <th>관리</th>

                    </tr>

                </thead>


                <tbody>

                    {
                        noticeList.length === 0

                        ?

                        <tr>

                            <td
                                colSpan="6"
                                className="notice-empty"
                            >
                                등록된 공지사항이 없습니다.
                            </td>

                        </tr>

                        :

                        noticeList.map(
                            (notice) => (

                                <tr
                                    key={
                                        notice.noticeNo
                                    }
                                >

                                    <td>
                                        {
                                            notice.noticeNo
                                        }
                                    </td>

                                    <td
                                        className="notice-title-cell"
                                        onClick={() =>
                                            navigate(
                                                `/notice/${notice.noticeNo}`
                                            )
                                        }
                                    >
                                        {
                                            notice.noticeTitle
                                        }
                                    </td>

                                    <td>
                                        {
                                            notice.empName ||
                                            '-'
                                        }
                                    </td>

                                    <td>
                                        {
                                            notice.createdAt
                                                ? new Date(
                                                    notice.createdAt
                                                ).toLocaleDateString(
                                                    'ko-KR'
                                                )
                                                : '-'
                                        }
                                    </td>

                                    <td>
                                        {
                                            notice.viewCount ??
                                            0
                                        }
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/notice/update/${notice.noticeNo}`
                                                )
                                            }
                                        >
                                            수정
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleDelete(
                                                    e,
                                                    notice.noticeNo
                                                )
                                            }
                                        >
                                            삭제
                                        </button>

                                    </td>

                                </tr>

                            )
                        )
                    }

                </tbody>

            </table>

        </div>

    );
}
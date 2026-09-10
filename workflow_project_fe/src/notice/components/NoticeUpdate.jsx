import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import NoticeForm from './NoticeForm';
import '../styles/Notice.css';

export default function NoticeUpdate() {

    const { noticeNo } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        noticeTitle: '',
        noticeContent: '',
        noticeStatus: 'VISIBLE'
    });

    // =========================================================
    // 공지사항 조회
    // =========================================================

    const fetchNotice = async () => {

        try {

            const data =
                await noticeApi.getNoticeDetail(noticeNo);

            console.log(
                '공지사항 수정 조회:',
                data
            );

            setForm({
                noticeTitle:
                    data.noticeTitle || '',

                noticeContent:
                    data.noticeContent || '',

                noticeStatus:
                    data.noticeStatus || 'VISIBLE'
            });

        } catch (error) {

            console.error(
                '공지사항 조회 실패:',
                error
            );

            alert(
                '공지사항을 불러오지 못했습니다.'
            );

            navigate('/notice');

        }

    };


    // =========================================================
    // 최초 조회
    // =========================================================

    useEffect(() => {

        if (noticeNo) {
            fetchNotice();
        }

    }, [noticeNo]);


    // =========================================================
    // 수정
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.noticeTitle.trim()) {

            alert(
                '공지사항 제목을 입력해주세요.'
            );

            return;

        }

        if (!form.noticeContent.trim()) {

            alert(
                '공지사항 내용을 입력해주세요.'
            );

            return;

        }


        try {

            /*
             * Spring @RequestPart("notice")에 맞게
             * multipart/form-data 생성
             */

            const formData = new FormData();

            const notice = {

                noticeTitle:
                    form.noticeTitle,

                noticeContent:
                    form.noticeContent,

                noticeStatus:
                    form.noticeStatus

            };


            formData.append(
                'notice',
                new Blob(
                    [JSON.stringify(notice)],
                    {
                        type: 'application/json'
                    }
                )
            );


            console.log(
                '공지사항 수정 요청:',
                notice
            );


            await noticeApi.updateNotice(
                noticeNo,
                formData
            );


            alert(
                '공지사항이 수정되었습니다.'
            );


            navigate(
                `/notice/${noticeNo}`
            );

        } catch (error) {

            console.error(
                '공지사항 수정 실패:',
                error
            );

            if (error.response) {

                console.error(
                    '서버 응답:',
                    error.response.data
                );

                console.error(
                    'HTTP 상태:',
                    error.response.status
                );

            }

            alert(
                '공지사항 수정에 실패했습니다.'
            );

        }

    };


    return (

        <main className="notice-container">

            <section className="notice-header wf-page-header">
                <div>
                    <h1 className="wf-page-title">공지사항 수정</h1>
                    <p className="wf-page-description">공지사항 내용을 수정합니다.</p>
                </div>
            </section>

            <div className="wf-page-content">
                <NoticeForm
                    form={form}
                    setForm={setForm}
                    onSubmit={handleSubmit}
                    submitText="수정"
                />
            </div>

        </main>

    );

}
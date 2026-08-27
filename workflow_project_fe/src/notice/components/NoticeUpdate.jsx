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


    const fetchNotice = async () => {

        try {

            const data =
                await noticeApi.getNoticeDetail(
                    noticeNo
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

            navigate('/admin/notice');

        }

    };


    useEffect(() => {

        if (noticeNo) {
            fetchNotice();
        }

    }, [noticeNo]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await noticeApi.updateNotice(
                noticeNo,
                form
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

            alert(
                '공지사항 수정에 실패했습니다.'
            );

        }

    };


    return (

        <div className="notice-container">

            <div className="notice-header">

                <h2>
                    공지사항 수정
                </h2>

            </div>

            <NoticeForm
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                submitText="수정"
            />

        </div>

    );
}
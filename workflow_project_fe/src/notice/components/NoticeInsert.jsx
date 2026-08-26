import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeApi } from '../api/noticeApi';
import NoticeForm from './NoticeForm';
import '../styles/Notice.css';

export default function NoticeInsert() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        noticeTitle: '',
        noticeContent: '',
        noticeStatus: 'VISIBLE'
    });


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await noticeApi.insertNotice(form);

            alert(
                '공지사항이 등록되었습니다.'
            );

            navigate('/admin/notice');

        } catch (error) {

            console.error(
                '공지사항 등록 실패:',
                error
            );

            alert(
                '공지사항 등록에 실패했습니다.'
            );

        }

    };


    return (

        <div className="notice-container">

            <div className="notice-header">

                <h2>
                    공지사항 등록
                </h2>

            </div>

            <NoticeForm
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                submitText="등록"
            />

        </div>

    );
}
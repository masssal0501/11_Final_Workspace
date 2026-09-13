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

    // 기존 첨부파일 (읽기 전용 표시용)
    const [existingFiles, setExistingFiles] = useState([]);

    // 새로 추가할 첨부파일
    const [newFiles, setNewFiles] = useState([]);


    // =========================================================
    // 공지사항 조회
    // =========================================================

    const fetchNotice = async () => {

        try {

            const data = await noticeApi.getNoticeForEdit(noticeNo);

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

            setExistingFiles(
                data.fileList || []
            );

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
    // 파일 선택
    // =========================================================

    const handleFileChange = (e) => {

        const selected =
            Array.from(e.target.files || []);

        setNewFiles((prev) => [
            ...prev,
            ...selected
        ]);

        // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
        e.target.value = '';

    };


    // 삭제할 기존 파일 번호를 모아둠 (즉시 API 호출하지 않고 저장 시 함께 처리하거나, 바로 삭제)
const handleRemoveExistingFile = async (noticefileNo) => {

    const confirmed = window.confirm('첨부파일을 삭제하시겠습니까?');

    if (!confirmed) {
        return;
    }

    try {

        await noticeApi.deleteFile(noticefileNo);

        setExistingFiles((prev) =>
            prev.filter((f) => f.noticefileNo !== noticefileNo)
        );

        alert('첨부파일이 삭제되었습니다.');

    } catch (error) {

        console.error('첨부파일 삭제 실패:', error);
        alert('첨부파일 삭제에 실패했습니다.');
    }
};

    // =========================================================
    // 새 파일 제거
    // =========================================================

    const handleRemoveNewFile = (index) => {

        setNewFiles((prev) =>
            prev.filter((_, i) => i !== index)
        );

    };


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


            // -------------------------------------------------
            // 새 첨부파일
            //
            // 서버 @RequestPart(value = "files", required = false)
            // List<MultipartFile>와 매칭되도록 같은 파트 이름으로 반복 append
            // -------------------------------------------------

            newFiles.forEach((file) => {

                formData.append(
                    'files',
                    file
                );

            });


            console.log(
                '공지사항 수정 요청:',
                notice
            );

            console.log(
                '새 첨부파일 개수:',
                newFiles.length
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
                    existingFiles={existingFiles}
                    newFiles={newFiles}
                    onFileChange={handleFileChange}
                    onRemoveNewFile={handleRemoveNewFile}
                    onRemoveExistingFile={handleRemoveExistingFile}
                    getFileDownloadUrl={noticeApi.getFileDownloadUrl}
                />
            </div>

        </main>

    );

}
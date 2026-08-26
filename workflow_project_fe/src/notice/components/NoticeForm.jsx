import React from 'react';

export default function NoticeForm({
    form,
    setForm,
    onSubmit,
    submitText = '등록'
}) {

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));

    };


    return (

        <form
            className="notice-form"
            onSubmit={onSubmit}
        >

            <div className="notice-form-row">

                <label>
                    제목
                </label>

                <input
                    type="text"
                    name="noticeTitle"
                    value={
                        form.noticeTitle || ''
                    }
                    onChange={handleChange}
                    placeholder="공지사항 제목을 입력하세요."
                    required
                />

            </div>


            <div className="notice-form-row">

                <label>
                    상태
                </label>

                <select
                    name="noticeStatus"
                    value={
                        form.noticeStatus || 'VISIBLE'
                    }
                    onChange={handleChange}
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


            <div className="notice-form-row content-row">

                <label>
                    내용
                </label>

                <textarea
                    name="noticeContent"
                    value={
                        form.noticeContent || ''
                    }
                    onChange={handleChange}
                    placeholder="공지사항 내용을 입력하세요."
                    required
                />

            </div>


            <div className="notice-form-buttons">

                <button
                    type="submit"
                    className="notice-btn primary"
                >
                    {submitText}
                </button>

            </div>

        </form>

    );
}
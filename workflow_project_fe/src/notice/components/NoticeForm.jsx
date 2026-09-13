import React from 'react';

export default function NoticeForm({
    form,
    setForm,
    onSubmit,
    submitText = '등록',
    existingFiles = [],
    newFiles = [],
    onFileChange,
    onRemoveNewFile,
    onRemoveExistingFile,
    getFileDownloadUrl
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
                    제목<span className="wf-required">*</span>
                </label>

                <input
                    type="text"
                    name="noticeTitle"
                    value={form.noticeTitle || ''}
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
                    value={form.noticeStatus || 'VISIBLE'}
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
                    내용<span className="wf-required">*</span>
                </label>

                <textarea
                    name="noticeContent"
                    value={form.noticeContent || ''}
                    onChange={handleChange}
                    placeholder="공지사항 내용을 입력하세요."
                    required
                />

            </div>


            {onFileChange ? (

                <div className="notice-form-row">

                    <label>
                        첨부파일
                    </label>

                    <div className="notice-file-input-wrap">

                        {existingFiles.length > 0 ? (

                            <div className="notice-existing-files">

                                <p>기존 첨부파일</p>

                                {existingFiles.map((file) => {

    const key = file.noticefileNo;

    return (
        <div key={key} className="notice-existing-file">

            {getFileDownloadUrl ? (
                <a href={getFileDownloadUrl(file.noticefileNo)}>
                    파일 {file.originName}
                </a>
            ) : (
                <span>파일 {file.originName}</span>
            )}

            {onRemoveExistingFile ? (
                <button
                    type="button"
                    className="notice-remove-file-button"
                    onClick={() => onRemoveExistingFile(file.noticefileNo)}
                >
                    삭제
                </button>
            ) : null}

        </div>
    );
})}

                            </div>

                        ) : null}


                        <input
                            type="file"
                            multiple
                            onChange={onFileChange}
                        />


                        {newFiles.length > 0 ? (

                            <div className="notice-selected-files">

                                {newFiles.map((file, index) => {

                                    const key = file.name + '-' + index;

                                    return (
                                        <div key={key}>

                                            <span>{file.name}</span>

                                            {onRemoveNewFile ? (

                                                <button
                                                    type="button"
                                                    className="notice-remove-file-button"
                                                    onClick={() => onRemoveNewFile(index)}
                                                >
                                                    삭제
                                                </button>

                                            ) : null}

                                        </div>
                                    );

                                })}

                            </div>

                        ) : null}


                        <p className="notice-file-help">
                            파일당 최대 10MB, 이미지 파일만 업로드할 수 있습니다.
                        </p>

                    </div>

                </div>

            ) : null}


            <div className="notice-form-buttons">

                <button
                    type="submit"
                    className="primary"
                >
                    {submitText}
                </button>

            </div>

        </form>

    );
}
package com.kh.workflow.notice.vo;

import java.sql.Timestamp;

public class NoticeFile {

    private int noticefileNo;
    private String filePath;
    private String originName;
    private String changeName;
    private Timestamp updatedAt;
    private String status;
    private int noticeNo;

    public NoticeFile() {
    }

    public int getNoticefileNo() {
        return noticefileNo;
    }

    public void setNoticefileNo(int noticefileNo) {
        this.noticefileNo = noticefileNo;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getOriginName() {
        return originName;
    }

    public void setOriginName(String originName) {
        this.originName = originName;
    }

    public String getChangeName() {
        return changeName;
    }

    public void setChangeName(String changeName) {
        this.changeName = changeName;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getNoticeNo() {
        return noticeNo;
    }

    public void setNoticeNo(int noticeNo) {
        this.noticeNo = noticeNo;
    }

    @Override
    public String toString() {
        return "NoticeFile [noticefileNo=" + noticefileNo
                + ", filePath=" + filePath
                + ", originName=" + originName
                + ", changeName=" + changeName
                + ", updatedAt=" + updatedAt
                + ", status=" + status
                + ", noticeNo=" + noticeNo
                + "]";
    }
}
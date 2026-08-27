package com.kh.workflow.notice.vo;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class Notice {

    private int noticeNo;
    private String noticeTitle;
    private String noticeContent;
    private Timestamp createdAt;
    private String noticeStatus;
    private int viewCount;
    private int empNo;

    // 작성자 이름
    private String empName;

    // 첨부파일
    private List<NoticeFile> fileList;

    private List<MultipartFile> files;
    
    public Notice() {
    }

    public List<MultipartFile> getFiles() {
        return files;
    }

    public void setFiles(List<MultipartFile> files) {
        this.files = files;
    }
    
    public int getNoticeNo() {
        return noticeNo;
    }

    public void setNoticeNo(int noticeNo) {
        this.noticeNo = noticeNo;
    }

    public String getNoticeTitle() {
        return noticeTitle;
    }

    public void setNoticeTitle(String noticeTitle) {
        this.noticeTitle = noticeTitle;
    }

    public String getNoticeContent() {
        return noticeContent;
    }

    public void setNoticeContent(String noticeContent) {
        this.noticeContent = noticeContent;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public String getNoticeStatus() {
        return noticeStatus;
    }

    public void setNoticeStatus(String noticeStatus) {
        this.noticeStatus = noticeStatus;
    }

    public int getViewCount() {
        return viewCount;
    }

    public void setViewCount(int viewCount) {
        this.viewCount = viewCount;
    }

    public int getEmpNo() {
        return empNo;
    }

    public void setEmpNo(int empNo) {
        this.empNo = empNo;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public List<NoticeFile> getFileList() {
        return fileList;
    }

    public void setFileList(List<NoticeFile> fileList) {
        this.fileList = fileList;
    }

    @Override
    public String toString() {
        return "Notice [noticeNo=" + noticeNo
                + ", noticeTitle=" + noticeTitle
                + ", noticeContent=" + noticeContent
                + ", createdAt=" + createdAt
                + ", noticeStatus=" + noticeStatus
                + ", viewCount=" + viewCount
                + ", empNo=" + empNo
                + ", empName=" + empName
                + ", fileList=" + fileList
                + "]";
    }
}
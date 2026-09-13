package com.kh.workflow.notice.service;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

import com.kh.workflow.notice.vo.Notice;

public interface NoticeService {

    // =========================================================
    // 공지사항 총 개수 조회용 서비스
    // 검색 조건 포함
    // =========================================================
    int selectNoticeCount(Map<String, Object> map);


    // =========================================================
    // 공지사항 목록 조회용 서비스
    // 검색 및 페이징 포함
    // =========================================================
    ArrayList<Notice> selectNoticeList(Map<String, Object> map);

    int deleteFile(int noticefileNo);
    // =========================================================
    // 공지사항 상세 조회용 서비스
    // =========================================================
    Notice selectNotice(int noticeNo);


    // =========================================================
    // 공지사항 작성용 서비스
    // =========================================================
    int insertNotice(Notice n);


    // =========================================================
    // 공지사항 수정용 서비스
    // =========================================================
    int updateNotice(Notice n);


    // =========================================================
    // 공지사항 삭제용 서비스
    // =========================================================
    int deleteNotice(int noticeNo);


    // =========================================================
    // 로그인 ID로 사원번호 조회
    // =========================================================
    Integer selectEmpNoByLoginId(String loginId);

 // =========================================================
 // 공지사항 조회 (조회수 증가 없음) - 수정 화면 전용
 // =========================================================
 Notice selectNoticeForEdit(int noticeNo);

    // =========================================================
    // 관리자 권한 확인
    //
    // authority.auth_code = 'ADMIN'인 경우 true
    // 그 외에는 false
    // =========================================================
    boolean isAdmin(String loginId);


    // =========================================================
    // 첨부파일 다운로드
    // =========================================================
    ResponseEntity<Resource> downloadFile(int noticefileNo);

}
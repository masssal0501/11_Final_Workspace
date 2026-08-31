package com.kh.workflow.notice.service;

import java.util.ArrayList;
import java.util.Map;

import com.kh.workflow.notice.vo.Notice;

public interface NoticeService {

	// 공지사항 총 개수 조회용 서비스 (검색 조건 포함)
	int selectNoticeCount(Map<String, Object> map);

	// 공지사항 목록 조회용 서비스 (검색 및 페이징 포함)
	ArrayList<Notice> selectNoticeList(Map<String, Object> map);
	
	// 공지사항 상세 조회용 서비스
	Notice selectNotice(int noticeNo);
	
	// 공지사항 작성용 서비스
	int insertNotice(Notice n);
	
	// 공지사항 수정용 서비스
	int updateNotice(Notice n);
	
	// 공지사항 삭제용 서비스
	int deleteNotice(int noticeNo);
	
	// 로그인 ID로 사원번호 조회
    Integer selectEmpNoByLoginId(String loginId);
	
}
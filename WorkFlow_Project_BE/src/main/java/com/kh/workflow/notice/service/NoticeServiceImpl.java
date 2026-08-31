package com.kh.workflow.notice.service;

import java.util.ArrayList;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.notice.dao.NoticeDao;
import com.kh.workflow.notice.vo.Notice;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeDao noticeDao;

    @Autowired
    private SqlSessionTemplate sqlSession;


    // =========================================================
    // 공지사항 총 개수 조회
    // =========================================================

    @Override
    public int selectNoticeCount(Map<String, Object> map) {

        return noticeDao.selectNoticeCount(
                sqlSession,
                map
        );
    }


    // =========================================================
    // 공지사항 목록 조회
    // =========================================================

    @Override
    public ArrayList<Notice> selectNoticeList(
            Map<String, Object> map) {

        return noticeDao.selectNoticeList(
                sqlSession,
                map
        );
    }


    // =========================================================
    // 공지사항 상세 조회
    // =========================================================

    @Override
    public Notice selectNotice(int noticeNo) {

        return noticeDao.selectNotice(
                sqlSession,
                noticeNo
        );
    }


    // =========================================================
    // 공지사항 등록
    // =========================================================

    @Transactional
    @Override
    public int insertNotice(Notice n) {

        return noticeDao.insertNotice(
                sqlSession,
                n
        );
    }


    // =========================================================
    // 공지사항 수정
    // =========================================================

    @Transactional
    @Override
    public int updateNotice(Notice n) {

        return noticeDao.updateNotice(
                sqlSession,
                n
        );
    }


    // =========================================================
    // 공지사항 삭제
    // =========================================================

    @Transactional
    @Override
    public int deleteNotice(int noticeNo) {

        return noticeDao.deleteNotice(
                sqlSession,
                noticeNo
        );
    }


    // =========================================================
    // 로그인 ID로 사원번호 조회
    // =========================================================

    @Override
    public Integer selectEmpNoByLoginId(String loginId) {

        return noticeDao.selectEmpNoByLoginId(
                sqlSession,
                loginId
        );
    }


    // =========================================================
    // 관리자 권한 확인
    //
    // authority.auth_code = 'ADMIN'
    // =========================================================

    @Override
    public boolean isAdmin(String loginId) {

        return noticeDao.isAdmin(
                sqlSession,
                loginId
        );
    }

}


package com.kh.workflow.notice.service;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kh.workflow.notice.dao.NoticeDao;
import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.vo.NoticeFile;

@Service
public class NoticeServiceImpl implements NoticeService {

    @Autowired
    private NoticeDao noticeDao;

    @Autowired
    private SqlSessionTemplate sqlSession;


    // =========================================================
    // 공지사항 개수 조회
    // =========================================================

    @Override
    public int selectNoticeCount(Map<String, Object> param) {

        return noticeDao.selectNoticeCount(
                sqlSession,
                param
        );
    }


    // =========================================================
    // 공지사항 목록 조회
    // =========================================================

    @Override
    public List<Notice> selectNoticeList(
            Map<String, Object> param) {

        return noticeDao.selectNoticeList(
                sqlSession,
                param
        );
    }


    // =========================================================
    // 공지사항 상세 조회
    // =========================================================

    @Override
    @Transactional
    public Notice selectNoticeByNo(int noticeNo) {

        // 조회수 증가
        noticeDao.increaseViewCount(
                sqlSession,
                noticeNo
        );

        // 공지사항 조회
        Notice notice =
                noticeDao.selectNoticeByNo(
                        sqlSession,
                        noticeNo
                );

        // 첨부파일 조회
        if (notice != null) {

            List<NoticeFile> fileList =
                    noticeDao.selectNoticeFileList(
                            sqlSession,
                            noticeNo
                    );

            notice.setFileList(fileList);
        }

        return notice;
    }


    // =========================================================
    // 공지사항 등록
    // =========================================================

    @Override
    @Transactional
    public int insertNotice(Notice notice) {

        return noticeDao.insertNotice(
                sqlSession,
                notice
        );
    }


    // =========================================================
    // 공지사항 수정
    // =========================================================

    @Override
    @Transactional
    public int updateNotice(Notice notice) {

        return noticeDao.updateNotice(
                sqlSession,
                notice
        );
    }


    // =========================================================
    // 공지사항 삭제
    // =========================================================

    @Override
    @Transactional
    public int deleteNotice(int noticeNo) {

        return noticeDao.deleteNotice(
                sqlSession,
                noticeNo
        );
    }


    // =========================================================
    // 첨부파일 등록
    // =========================================================

    @Override
    @Transactional
    public int insertNoticeFile(NoticeFile file) {

        return noticeDao.insertNoticeFile(
                sqlSession,
                file
        );
    }


    // =========================================================
    // 첨부파일 삭제
    // =========================================================

    @Override
    @Transactional
    public int deleteNoticeFile(int noticefileNo) {

        return noticeDao.deleteNoticeFile(
                sqlSession,
                noticefileNo
        );
    }

}
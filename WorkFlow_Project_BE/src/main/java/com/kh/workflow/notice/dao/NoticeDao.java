package com.kh.workflow.notice.dao;

import java.util.List;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.vo.NoticeFile;

@Repository
public class NoticeDao {

    public int selectNoticeCount(
            SqlSessionTemplate sqlSession,
            Map<String, Object> param) {

        return sqlSession.selectOne(
                "noticeMapper.selectNoticeCount",
                param
        );
    }


    public List<Notice> selectNoticeList(
            SqlSessionTemplate sqlSession,
            Map<String, Object> param) {

        return sqlSession.selectList(
                "noticeMapper.selectNoticeList",
                param
        );
    }


    public Notice selectNoticeByNo(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.selectOne(
                "noticeMapper.selectNoticeByNo",
                noticeNo
        );
    }


    public int increaseViewCount(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.update(
                "noticeMapper.increaseViewCount",
                noticeNo
        );
    }


    public int insertNotice(
            SqlSessionTemplate sqlSession,
            Notice notice) {

        return sqlSession.insert(
                "noticeMapper.insertNotice",
                notice
        );
    }


    public int updateNotice(
            SqlSessionTemplate sqlSession,
            Notice notice) {

        return sqlSession.update(
                "noticeMapper.updateNotice",
                notice
        );
    }


    public int deleteNotice(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.update(
                "noticeMapper.deleteNotice",
                noticeNo
        );
    }


    public List<NoticeFile> selectNoticeFileList(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.selectList(
                "noticeMapper.selectNoticeFileList",
                noticeNo
        );
    }


    public int insertNoticeFile(
            SqlSessionTemplate sqlSession,
            NoticeFile file) {

        return sqlSession.insert(
                "noticeMapper.insertNoticeFile",
                file
        );
    }


    public int deleteNoticeFile(
            SqlSessionTemplate sqlSession,
            int noticefileNo) {

        return sqlSession.update(
                "noticeMapper.deleteNoticeFile",
                noticefileNo
        );
    }

}
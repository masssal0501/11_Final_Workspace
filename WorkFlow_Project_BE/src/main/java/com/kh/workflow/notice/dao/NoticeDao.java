package com.kh.workflow.notice.dao;

import java.util.ArrayList;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.stereotype.Repository;

import com.kh.workflow.notice.vo.Notice;

@Repository
public class NoticeDao {

    // 공지사항 개수 조회
    public int selectNoticeCount(
            SqlSessionTemplate sqlSession,
            Map<String, Object> map) {

        return sqlSession.selectOne(
                "noticeMapper.selectNoticeCount",
                map
        );
    }


    // 공지사항 목록 조회
 // 공지사항 목록 조회
    public ArrayList<Notice> selectNoticeList(
            SqlSessionTemplate sqlSession,
            Map<String, Object> map) {

        return new ArrayList<>(
            sqlSession.selectList(
                "noticeMapper.selectNoticeList",
                map
            )
        );
    }


    // 공지사항 등록
    public int insertNotice(
            SqlSessionTemplate sqlSession,
            Notice n) {

        return sqlSession.insert(
                "noticeMapper.insertNotice",
                n
        );
    }


    // 공지사항 상세 조회
    public Notice selectNotice(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.selectOne(
                "noticeMapper.selectNotice",
                noticeNo
        );
    }


    // 공지사항 수정
    public int updateNotice(
            SqlSessionTemplate sqlSession,
            Notice n) {

        return sqlSession.update(
                "noticeMapper.updateNotice",
                n
        );
    }


    // 공지사항 삭제
    public int deleteNotice(
            SqlSessionTemplate sqlSession,
            int noticeNo) {

        return sqlSession.delete(
                "noticeMapper.deleteNotice",
                noticeNo
        );
    }


    // 로그인 ID로 사원번호 조회
    public Integer selectEmpNoByLoginId(
            SqlSessionTemplate sqlSession,
            String loginId) {

        return sqlSession.selectOne(
                "noticeMapper.selectEmpNoByLoginId",
                loginId
        );
    }
}
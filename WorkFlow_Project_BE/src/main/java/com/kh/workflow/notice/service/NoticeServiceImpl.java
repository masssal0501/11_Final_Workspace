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

	@Override
	public int selectNoticeCount(Map<String, Object> map) {
		return noticeDao.selectNoticeCount(sqlSession, map);
	}

	@Override
	public ArrayList<Notice> selectNoticeList(Map<String, Object> map) {
		return noticeDao.selectNoticeList(sqlSession, map);
	}

	@Override
	public Notice selectNotice(int noticeNo) {
		return noticeDao.selectNotice(sqlSession, noticeNo);
	}

	@Transactional
	@Override
	public int insertNotice(Notice n) {
		return noticeDao.insertNotice(sqlSession, n);
	}

	@Transactional
	@Override
	public int updateNotice(Notice n) {
		return noticeDao.updateNotice(sqlSession, n);
	}

	@Transactional
	@Override
	public int deleteNotice(int noticeNo) {
		return noticeDao.deleteNotice(sqlSession, noticeNo);
	}

	@Override
	public Integer selectEmpNoByLoginId(String loginId) {

	    return noticeDao.selectEmpNoByLoginId(
	            sqlSession,
	            loginId
	    );
	}
}
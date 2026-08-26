package com.kh.workflow.notice.service;

import java.util.List;
import java.util.Map;

import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.vo.NoticeFile;

public interface NoticeService {

    int selectNoticeCount(Map<String, Object> param);

    List<Notice> selectNoticeList(Map<String, Object> param);

    Notice selectNoticeByNo(int noticeNo);

    int insertNotice(Notice notice);

    int updateNotice(Notice notice);

    int deleteNotice(int noticeNo);

    int insertNoticeFile(NoticeFile file);

    int deleteNoticeFile(int noticefileNo);
}
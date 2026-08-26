package com.kh.workflow.notice.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.kh.workflow.notice.service.NoticeService;
import com.kh.workflow.notice.vo.Notice;

@RestController
@RequestMapping("/api/notice")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;


    /**
     * 공지사항 목록
     *
     * GET
     * /api/notices
     *
     * /api/notices?page=1
     * /api/notices?page=1&condition=title&keyword=휴가
     */
    @GetMapping
    public Map<String, Object> selectNoticeList(

            @RequestParam(
                defaultValue = "1"
            ) int page,

            @RequestParam(
                required = false
            ) String condition,

            @RequestParam(
                required = false
            ) String keyword) {

        int limit = 10;

        int offset = (page - 1) * limit;

        Map<String, Object> param =
                new HashMap<>();

        param.put("condition", condition);
        param.put("keyword", keyword);
        param.put("offset", offset);
        param.put("limit", limit);

        int listCount =
                noticeService.selectNoticeCount(
                        param
                );

        List<Notice> list =
                noticeService.selectNoticeList(
                        param
                );

        Map<String, Object> result =
                new HashMap<>();

        result.put("list", list);
        result.put("listCount", listCount);
        result.put("page", page);
        result.put("limit", limit);

        return result;
    }


    /**
     * 공지사항 상세
     */
    @GetMapping("/{noticeNo}")
    public Notice selectNoticeByNo(
            @PathVariable int noticeNo) {

        return noticeService.selectNoticeByNo(
                noticeNo
        );
    }


    /**
     * 공지사항 등록
     */
    @PostMapping
    public Map<String, Object> insertNotice(
            @RequestBody Notice notice) {

        int result =
                noticeService.insertNotice(
                        notice
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                result > 0
        );

        response.put(
                "noticeNo",
                notice.getNoticeNo()
        );

        return response;
    }


    /**
     * 공지사항 수정
     */
    @PutMapping("/{noticeNo}")
    public Map<String, Object> updateNotice(

            @PathVariable int noticeNo,

            @RequestBody Notice notice) {

        notice.setNoticeNo(noticeNo);

        int result =
                noticeService.updateNotice(
                        notice
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                result > 0
        );

        return response;
    }


    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeNo}")
    public Map<String, Object> deleteNotice(
            @PathVariable int noticeNo) {

        int result =
                noticeService.deleteNotice(
                        noticeNo
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                result > 0
        );

        return response;
    }
}
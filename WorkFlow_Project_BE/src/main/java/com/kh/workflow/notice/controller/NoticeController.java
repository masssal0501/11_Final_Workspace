package com.kh.workflow.notice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.service.NoticeService;

@RestController
@RequestMapping("/api/v1/notice")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    /**
     * 공지사항 등록 (JSON 데이터 + MultipartFile 리스트)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> insertNotice(
            @RequestPart("notice") Notice notice,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            // 프론트에서 보낸 파일 리스트를 Notice 객체의 files 필드에 주입
            if (files != null && !files.isEmpty()) {
                notice.setFiles(files);
            }

            // 로그인한 사원번호 처리 (세션이나 토큰에서 가져오거나, 
            // 현재 로그인 정보를 프론트에서 notice 객체에 담아 보내지 않았다면 여기서 세팅 필요)
            // 예시: notice.setEmpNo(로그인한_사원번호); 
            // 만약 프론트의 notice 객체에 empNo가 포함되어 있다면 이 과정은 생략됩니다.

            noticeService.insertNotice(notice);

            return ResponseEntity.status(HttpStatus.CREATED).body("공지사항이 성공적으로 등록되었습니다.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("공지사항 등록 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
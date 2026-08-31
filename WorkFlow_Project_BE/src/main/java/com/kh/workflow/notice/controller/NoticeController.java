package com.kh.workflow.notice.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.notice.service.NoticeService;
import com.kh.workflow.notice.vo.Notice;

@RestController
@RequestMapping("/api/v1/notice")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }


    // =========================================================
    // 공지사항 목록 조회
    //
    // GET /api/v1/notice
    //
    // 예:
    // /api/v1/notice?page=1&limit=10&condition=title&keyword=
    // =========================================================

    @GetMapping
    public ResponseEntity<?> selectNoticeList(

            @RequestParam(defaultValue = "1")
            int page,

            @RequestParam(defaultValue = "10")
            int limit,

            @RequestParam(defaultValue = "title")
            String condition,

            @RequestParam(defaultValue = "")
            String keyword) {

        try {

            // 페이지가 1보다 작아지는 것 방지
            if (page < 1) {
                page = 1;
            }

            // limit이 잘못 들어오는 것 방지
            if (limit < 1) {
                limit = 10;
            }


            // -------------------------------------------------
            // 페이징 계산
            // -------------------------------------------------

            int offset = (page - 1) * limit;


            // -------------------------------------------------
            // 검색 + 페이징 조건
            // -------------------------------------------------

            Map<String, Object> map = new HashMap<>();

            map.put("offset", offset);
            map.put("limit", limit);
            map.put("condition", condition);
            map.put("keyword", keyword);


            // -------------------------------------------------
            // 공지사항 목록 조회
            // -------------------------------------------------

            ArrayList<Notice> noticeList =
                    noticeService.selectNoticeList(map);


            // -------------------------------------------------
            // 전체 공지사항 개수 조회
            // -------------------------------------------------

            int listCount =
                    noticeService.selectNoticeCount(map);


            // -------------------------------------------------
            // 응답 데이터
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put("noticeList", noticeList);
            response.put("listCount", listCount);
            response.put("page", page);
            response.put("limit", limit);


            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("공지사항 목록 조회 중 오류가 발생했습니다.");
        }
    }


    // =========================================================
    // 공지사항 상세 조회
    //
    // GET /api/v1/notice/{noticeNo}
    // =========================================================

    @GetMapping("/{noticeNo}")
    public ResponseEntity<?> selectNotice(

            @PathVariable int noticeNo) {

        try {

            Notice notice =
                    noticeService.selectNotice(noticeNo);


            if (notice == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("공지사항을 찾을 수 없습니다.");
            }


            return ResponseEntity.ok(notice);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("공지사항 조회 중 오류가 발생했습니다.");
        }
    }


    // =========================================================
    // 공지사항 등록
    //
    // POST /api/v1/notice
    //
    // Content-Type:
    // multipart/form-data
    //
    // notice = JSON
    // files  = 첨부파일
    // =========================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> insertNotice(

            @RequestPart("notice")
            Notice notice,

            @RequestPart(
                    value = "files",
                    required = false
            )
            List<MultipartFile> files,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 첨부파일
            // -------------------------------------------------

            if (files != null && !files.isEmpty()) {
                notice.setFiles(files);
            }


            // -------------------------------------------------
            // 로그인 사용자 확인
            // -------------------------------------------------

            if (authentication == null ||
                !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }


            /*
             * JWT Authentication에서 로그인 사용자 정보를
             * 가져오는 부분
             *
             * 현재 JwtAuthenticationFilter에서
             * Authentication에 무엇을 넣고 있는지에 따라
             * 이 부분은 맞춰줘야 합니다.
             *
             * 예를 들어 authentication.getName()이
             * 사원번호라면 아래처럼 사용합니다.
             */

            String loginId = authentication.getName();

            Integer empNo =
                    noticeService.selectEmpNoByLoginId(loginId);

            if (empNo == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("로그인 사용자 정보를 찾을 수 없습니다.");
            }

            notice.setEmpNo(empNo);


            // -------------------------------------------------
            // 로그인한 사용자의 사원번호 설정
            // -------------------------------------------------

            notice.setEmpNo(empNo);


            System.out.println(
                    "공지사항 등록 사용자 empNo = "
                    + notice.getEmpNo()
            );


            // -------------------------------------------------
            // 등록
            // -------------------------------------------------

            int result =
                    noticeService.insertNotice(notice);


            if (result > 0) {

                return ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body("공지사항이 성공적으로 등록되었습니다.");
            }


            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("공지사항 등록에 실패했습니다.");

        } catch (NumberFormatException e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("로그인 사용자 사원번호가 올바르지 않습니다.");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "공지사항 등록 중 오류가 발생했습니다: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 공지사항 수정
    //
    // PUT /api/v1/notice/{noticeNo}
    //
    // Content-Type:
    // multipart/form-data
    // =========================================================

    @PutMapping(
            value = "/{noticeNo}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateNotice(

            @PathVariable int noticeNo,

            @RequestPart("notice")
            Notice notice,

            @RequestPart(
                    value = "files",
                    required = false
            )
            List<MultipartFile> files) {

        try {

            // URL의 noticeNo를 Notice 객체에 설정
            notice.setNoticeNo(noticeNo);


            // 첨부파일
            if (files != null && !files.isEmpty()) {
                notice.setFiles(files);
            }


            // 수정
            int result =
                    noticeService.updateNotice(notice);


            if (result > 0) {

                return ResponseEntity.ok(
                        "공지사항이 수정되었습니다."
                );
            }


            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("공지사항 수정에 실패했습니다.");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "공지사항 수정 중 오류가 발생했습니다: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // 공지사항 삭제
    //
    // DELETE /api/v1/notice/{noticeNo}
    // =========================================================

    @DeleteMapping("/{noticeNo}")
    public ResponseEntity<?> deleteNotice(

            @PathVariable int noticeNo) {

        try {

            int result =
                    noticeService.deleteNotice(noticeNo);


            if (result > 0) {

                return ResponseEntity.ok(
                        "공지사항이 삭제되었습니다."
                );
            }


            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("공지사항 삭제에 실패했습니다.");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "공지사항 삭제 중 오류가 발생했습니다."
                    );
        }
    }
}
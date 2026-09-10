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
import java.util.List;

import com.kh.workflow.notice.service.NoticeService;
import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.notice.service.NoticeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "공지사항 관리", description = "공지사항 목록/상세 조회, 등록, 수정, 삭제 관련 API (등록·수정·삭제는 ADMIN 권한 필요)")
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
    // =========================================================

    @Operation(summary = "공지사항 목록 조회", description = "페이지네이션과 제목/내용 검색 조건을 적용해 공지사항 목록을 조회합니다. 로그인 없이 누구나 조회할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @GetMapping
    public ResponseEntity<?> selectNoticeList(

            @Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
            @RequestParam(defaultValue = "1")
            int page,

            @Parameter(description = "페이지당 조회 개수", example = "10")
            @RequestParam(defaultValue = "10")
            int limit,

            @Parameter(description = "검색 조건(title: 제목, content: 내용 등)", example = "title")
            @RequestParam(defaultValue = "title")
            String condition,

            @Parameter(description = "검색 키워드(미입력 시 전체 조회)", example = "")
            @RequestParam(defaultValue = "")
            String keyword) {

        try {

            if (page < 1) {
                page = 1;
            }

            if (limit < 1) {
                limit = 10;
            }


            // -------------------------------------------------
            // 페이징 계산
            // -------------------------------------------------

            int offset = (page - 1) * limit;


            // -------------------------------------------------
            // 검색 조건
            // -------------------------------------------------

            Map<String, Object> map = new HashMap<>();

            map.put("offset", offset);
            map.put("limit", limit);
            map.put("condition", condition);
            map.put("keyword", keyword);


            // -------------------------------------------------
            // 목록 조회
            // -------------------------------------------------

            ArrayList<Notice> noticeList =
                    noticeService.selectNoticeList(map);


            // -------------------------------------------------
            // 전체 개수
            // -------------------------------------------------

            int listCount =
                    noticeService.selectNoticeCount(map);


            // -------------------------------------------------
            // 응답
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

    @Operation(summary = "공지사항 상세 조회", description = "공지사항 번호로 상세 내용과 첨부파일 정보를 조회합니다. 로그인 없이 누구나 조회할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "해당 번호의 공지사항이 존재하지 않음", content = @Content),
        @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @GetMapping("/{noticeNo}")
    public ResponseEntity<?> selectNotice(

            @Parameter(description = "조회할 공지사항 번호", example = "1", required = true)
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
    // ★ ADMIN만 가능
    // authority.auth_code = ADMIN
    // =========================================================

    @Operation(summary = "공지사항 등록", description = "새 공지사항을 등록합니다. 첨부파일(다중)을 함께 업로드할 수 있으며, ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "400", description = "등록 실패 또는 로그인 사용자 정보를 찾을 수 없는 경우", content = @Content),
        @ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content),
        @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> insertNotice(

            @Parameter(description = "등록할 공지사항 정보(JSON)", required = true)
            @RequestPart("notice")
            Notice notice,

            @Parameter(description = "첨부파일 목록(선택, 다중 업로드 가능)")
            @RequestPart(
                    value = "files",
                    required = false
            )
            List<MultipartFile> files,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 로그인 확인
            // -------------------------------------------------

            if (authentication == null ||
                !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }


            // -------------------------------------------------
            // 관리자 권한 확인
            //
            // authority.auth_code = ADMIN
            // -------------------------------------------------

            String loginId =
                    authentication.getName();


            boolean isAdmin =
                    noticeService.isAdmin(loginId);


            if (!isAdmin) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("관리자만 공지사항을 등록할 수 있습니다.");
            }


            // -------------------------------------------------
            // 로그인 사용자 사원번호 조회
            // -------------------------------------------------

            Integer empNo =
                    noticeService.selectEmpNoByLoginId(loginId);


            if (empNo == null) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("로그인 사용자 정보를 찾을 수 없습니다.");
            }


            notice.setEmpNo(empNo);


            // -------------------------------------------------
            // 첨부파일
            // -------------------------------------------------

            if (files != null && !files.isEmpty()) {

                notice.setFiles(files);

            }


            System.out.println(
                    "공지사항 등록 사용자 empNo = "
                    + notice.getEmpNo()
            );


            System.out.println(
                    "공지사항 등록 사용자 loginId = "
                    + loginId
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
    // ★ ADMIN만 가능
    // authority.auth_code = ADMIN
    // =========================================================

    @Operation(summary = "공지사항 수정", description = "기존 공지사항의 내용을 수정합니다. 첨부파일을 새로 업로드할 수 있으며, ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "수정 실패", content = @Content),
        @ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content),
        @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @PutMapping(
            value = "/{noticeNo}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> updateNotice(

            @Parameter(description = "수정할 공지사항 번호", example = "1", required = true)
            @PathVariable int noticeNo,

            @Parameter(description = "수정할 공지사항 정보(JSON)", required = true)
            @RequestPart("notice")
            Notice notice,

            @Parameter(description = "새로 첨부할 파일 목록(선택, 다중 업로드 가능)")
            @RequestPart(
                    value = "files",
                    required = false
            )
            List<MultipartFile> files,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 로그인 확인
            // -------------------------------------------------

            if (authentication == null ||
                !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }


            // -------------------------------------------------
            // 관리자 권한 확인
            // -------------------------------------------------

            String loginId =
                    authentication.getName();


            boolean isAdmin =
                    noticeService.isAdmin(loginId);


            if (!isAdmin) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("관리자만 공지사항을 수정할 수 있습니다.");
            }


            // -------------------------------------------------
            // URL의 noticeNo 설정
            // -------------------------------------------------

            notice.setNoticeNo(noticeNo);


            // -------------------------------------------------
            // 첨부파일
            // -------------------------------------------------

            if (files != null && !files.isEmpty()) {

                notice.setFiles(files);

            }


            System.out.println(
                    "공지사항 수정 사용자 loginId = "
                    + loginId
            );

            System.out.println(
                    "공지사항 수정 noticeNo = "
                    + noticeNo
            );


            // -------------------------------------------------
            // 수정
            // -------------------------------------------------

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
    //
    // ★ ADMIN만 가능
    // authority.auth_code = ADMIN
    // =========================================================

    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다. ADMIN 권한을 가진 로그인 사용자만 호출할 수 있습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "삭제 성공"),
        @ApiResponse(responseCode = "400", description = "삭제 실패", content = @Content),
        @ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
        @ApiResponse(responseCode = "403", description = "ADMIN 권한이 아닌 경우", content = @Content),
        @ApiResponse(responseCode = "500", description = "서버 오류", content = @Content)
    })
    @SecurityRequirement(name = "JWT")
    @DeleteMapping("/{noticeNo}")
    public ResponseEntity<?> deleteNotice(

            @Parameter(description = "삭제할 공지사항 번호", example = "1", required = true)
            @PathVariable int noticeNo,

            Authentication authentication) {

        try {

            // -------------------------------------------------
            // 로그인 확인
            // -------------------------------------------------

            if (authentication == null ||
                !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body("로그인이 필요합니다.");
            }


            // -------------------------------------------------
            // 관리자 권한 확인
            // -------------------------------------------------

            String loginId =
                    authentication.getName();


            boolean isAdmin =
                    noticeService.isAdmin(loginId);


            if (!isAdmin) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("관리자만 공지사항을 삭제할 수 있습니다.");
            }


            System.out.println(
                    "공지사항 삭제 사용자 loginId = "
                    + loginId
            );

            System.out.println(
                    "공지사항 삭제 noticeNo = "
                    + noticeNo
            );


            // -------------------------------------------------
            // 삭제
            // -------------------------------------------------

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
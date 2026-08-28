package com.kh.workflow.notice.controller;

import java.util.ArrayList;

import java.util.List;
import java.util.Map;

=======
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
>>>>>>> Stashed changes
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
<<<<<<< Updated upstream
import org.springframework.web.bind.annotation.GetMapping;
=======
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
>>>>>>> Stashed changes
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.bind.annotation.RestController;


import com.kh.workflow.notice.service.NoticeService;
import com.kh.workflow.notice.vo.Notice;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/notice")
public class NoticeController {
	
	@Autowired
	private NoticeService noticeService;
	
	// 공지사항 목록 및 검색 조회용 컨트롤러
	@GetMapping
	public ResponseEntity<Map<String, Object>> selectNoticeList(
			@RequestParam(value = "page", defaultValue = "1") int page,
			@RequestParam(value = "limit", defaultValue = "10") int limit,
			@RequestParam(value = "condition", required = false) String condition,
			@RequestParam(value = "keyword", required = false) String keyword) { // 수정된 부분
		
		Map<String, Object> paramMap = new HashMap<>();
		paramMap.put("condition", condition);
		paramMap.put("keyword", keyword);
		
		int listCount = noticeService.selectNoticeCount(paramMap);
		
		int offset = (page - 1) * limit;
		paramMap.put("offset", offset);
		paramMap.put("limit", limit);
		
		ArrayList<Notice> list = noticeService.selectNoticeList(paramMap);
		
		Map<String, Object> responseData = new HashMap<>();
		responseData.put("list", list);
		responseData.put("listCount", listCount);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(responseData);
	}
	
	// 공지사항 작성용 컨트롤러
	@PostMapping
	public ResponseEntity<String> insertNotice(@RequestBody Notice n) {
		int result = noticeService.insertNotice(n);
		String message = (result > 0) ? "success" : "fail";
		return ResponseEntity.status(HttpStatus.OK).body(message);
	}


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
    
    /**
     * 공지사항 목록 조회 (페이징 및 검색 기능 포함)
     */
    @GetMapping
    public ResponseEntity<?> getNoticeList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "condition", required = false) String condition) {
        try {
            // 1. 마이바티스 / 서비스 구조에 맞게 맵에 검색 조건 및 페이징 정보 담기
            // (만약 프로젝트 내에 페이징 계산을 해주는 Util 클래스가 있다면 그것을 사용하세요)
            Map<String, Object> paramMap = new java.util.HashMap<>();
            paramMap.put("keyword", keyword);
            paramMap.put("condition", condition);
            
            // 예시: 페이징을 위한 offset, limit 계산이 필요한 경우 추가
            int limit = 10; // 한 페이지에 보여줄 개수 (프로젝트 설정에 맞게 조절)
            int offset = (page - 1) * limit;
            paramMap.put("offset", offset);
            paramMap.put("limit", limit);

            // 2. 서비스 호출 (인터페이스에 정의된 메서드 활용)
            int listCount = noticeService.selectNoticeCount(paramMap);
            ArrayList<Notice> noticeList = noticeService.selectNoticeList(paramMap);

            // 3. 프론트엔드로 전달할 데이터 묶음 생성
            Map<String, Object> responseMap = new java.util.HashMap<>();
            responseMap.put("listCount", listCount);
            responseMap.put("noticeList", noticeList);
            // 필요에 따라 PageInfo 객체나 추가 페이징 정보를 함께 담아주셔도 좋습니다.

            return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("공지사항 목록 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

	// 공지사항 상세조회용 컨트롤러
	@GetMapping("/{noticeNo}")
	public ResponseEntity<Notice> selectNotice(@PathVariable int noticeNo) {
		Notice n = noticeService.selectNotice(noticeNo);
		return ResponseEntity.status(HttpStatus.OK).body(n);
	}
	
	// 공지사항 수정용 컨트롤러
	@PutMapping("/{noticeNo}")
	public ResponseEntity<String> updateNotice(@PathVariable int noticeNo, 
											   @RequestBody Notice n) {
		int result = noticeService.updateNotice(n);
		String message = (result > 0) ? "success" : "fail";
		return ResponseEntity.status(HttpStatus.OK).body(message);
	}
	
	// 공지사항 삭제용 컨트롤러
	@DeleteMapping("/{noticeNo}")
	public ResponseEntity<String> deleteNotice(@PathVariable int noticeNo) {
		int result = noticeService.deleteNotice(noticeNo);
		String message = (result > 0) ? "success" : "fail";
		return ResponseEntity.status(HttpStatus.OK).body(message);
	}

}
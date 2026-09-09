package com.kh.workflow.approval.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.approval.model.service.ApprovalService;
import com.kh.workflow.common.model.vo.PageInfo;
import com.kh.workflow.common.template.Pagination;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.workcation.model.service.WorkcationService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import jakarta.servlet.http.HttpSession;

// CORS는 SecurityConfig에서 중앙 관리 (기본 @CrossOrigin은 모든 origin을 허용해 제거함)
@RestController
@RequestMapping("/approval")
public class ApprovalController {

	@Autowired
	private ApprovalService approvalService;
	
	@Autowired
	private WorkcationService workcationService;
	
	@Autowired
	private EmployeeDao employeeDao;

	// 승인 이력 목록 조회
	@GetMapping("/list")
	public ResponseEntity<Map<String, Object>> selectApprovalList(

			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,

			@RequestParam(value = "startDate", required = false) String startDate,

			@RequestParam(value = "endDate", required = false) String endDate,

			@RequestParam(value = "searchType", required = false) String searchType,

			@RequestParam(value = "keyword", required = false) String keyword,
			
			Authentication authentication) {
		
		String empId = authentication.getName();
		
		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
		
		String authCode = loginEmployee.getAuthCode();
		Integer empNo = loginEmployee.getEmpNo();
		String depId = loginEmployee.getDepId();

		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		// 검색 날짜 변환
		LocalDateTime startDateTime = null;
		LocalDateTime endDateTime = null;

		if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {

			startDateTime = LocalDate.parse(startDate).atStartOfDay();

			endDateTime = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
		}

		// 승인 이력 조회
		Page<WorkcationInfo> pageResult = approvalService.selectApprovalList(authCode, empNo, depId, searchType, keyword, startDateTime,
				endDateTime, pageable);

		int listCount = (int) pageResult.getTotalElements();

		PageInfo pageInfo = Pagination.getPageInfo(listCount, currentPage, 5, 10);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("pageInfo", pageInfo);

		return ResponseEntity.status(HttpStatus.OK).body(map);
	}

	// 승인 이력 상세 조회
	@GetMapping("/{workcationNo}")
	public ResponseEntity<WorkcationInfo> selectApproval(@PathVariable int workcationNo) {

		WorkcationInfo w = approvalService.selectApproval(workcationNo);

		return ResponseEntity.status(HttpStatus.OK).body(w);
	}

	// 승인 대기 목록 조회
	@GetMapping("/queue")
	public ResponseEntity<Map<String, Object>> selectApprovalQueueList(

			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,

			@RequestParam(value = "startDate", required = false) String startDate,

			@RequestParam(value = "endDate", required = false) String endDate,

			@RequestParam(value = "searchType", required = false) String searchType,

			@RequestParam(value = "keyword", required = false) String keyword,

			@RequestParam(value = "status", required = false) String status,
			
			Authentication authentication) {

		String empId = authentication.getName();
		
		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
		
		String authCode = loginEmployee.getAuthCode();
		Integer empNo = loginEmployee.getEmpNo();
		String depId = loginEmployee.getDepId();
		
		if ("STAFF".equals(authCode)) {
			
			return ResponseEntity
					.status(HttpStatus.FORBIDDEN)
					.build();
		}
		
		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		// 검색 날짜 변환
		LocalDateTime startDateTime = null;
		LocalDateTime endDateTime = null;

		if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {

			startDateTime = LocalDate.parse(startDate).atStartOfDay();

			endDateTime = LocalDate.parse(endDate).plusDays(1).atStartOfDay();
		}

		// 승인 대기 목록 조회
		Page<WorkcationInfo> pageResult = approvalService.selectApprovalQueueList(authCode, empNo, depId, status, searchType, keyword,
				startDateTime, endDateTime, pageable);

		int listCount = (int) pageResult.getTotalElements();

		PageInfo pageInfo = Pagination.getPageInfo(listCount, currentPage, 5, 10);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("pageInfo", pageInfo);

		return ResponseEntity.status(HttpStatus.OK).body(map);
	}

	// 승인 대기 상세 조회 (BUG-005 수정: 상태 제한 없이 조회 - ApprovalReject.jsx의
	// 승인/반려 처리 화면이 이 엔드포인트를 사용한다)
	@GetMapping("/queue/{workcationNo}")
	public ResponseEntity<WorkcationInfo> selectQueue(@PathVariable int workcationNo) {

		WorkcationInfo w = approvalService.selectApprovalQueueDetail(workcationNo);

		return ResponseEntity.status(HttpStatus.OK).body(w);
	}

	// 승인/반려 처리
	@PostMapping("/{workcationNo}")
	public ResponseEntity<String> rejectApproval(@PathVariable int workcationNo,
			@RequestPart("workcation") WorkcationInfo w, HttpSession session, Authentication authentication) {

		w.setWorkcationNo(workcationNo);

		// BUG-007: 승인/반려 처리자와 처리 시각을 클라이언트가 보내는 값에 의존하지 않고
		// 서버에서 인증된 사용자 기준으로 직접 기록한다(감사 이력 정확성 + 위변조 방지).
		Employee approver = employeeDao.findByEmpId(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));
		w.setApprover(approver);
		w.setApprovetAt(LocalDateTime.now());

		WorkcationInfo rejectApproval = approvalService.rejectApproval(w);

		String message = (rejectApproval != null) ? "success" : "fail";

		return ResponseEntity.status(HttpStatus.OK).body(message);
	}

}
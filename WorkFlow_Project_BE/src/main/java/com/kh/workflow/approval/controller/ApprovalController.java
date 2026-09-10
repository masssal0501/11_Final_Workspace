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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.servlet.http.HttpSession;

// CORS는 SecurityConfig에서 중앙 관리 (기본 @CrossOrigin은 모든 origin을 허용해 제거함)
@RestController
@RequestMapping("/approval")
@Tag(name = "승인 관리", description = "워케이션 신청에 대한 승인 이력 조회, 승인 대기 목록 조회 및 승인/반려 처리 API")
public class ApprovalController {

	@Autowired
	private ApprovalService approvalService;

	@Autowired
	private WorkcationService workcationService;

	@Autowired
	private EmployeeDao employeeDao;

	// 승인 이력 목록 조회
	@Operation(summary = "승인 이력 목록 조회", description = "로그인한 사원의 권한(authCode)·부서(depId)·사번(empNo) 기준으로 필터링된 승인/반려 이력 목록을 페이지 단위(페이지당 10건)로 조회합니다. 관리자/부서장은 소관 범위 전체를, 사원은 본인 신청 건만 조회됩니다(권한별 범위는 ApprovalDao 조회 조건에 따름). startDate/endDate가 모두 주어지면 해당 기간(종료일 다음날 00시 미만)으로 검색 범위를 제한합니다.\n\n인증된 사용자(STAFF/MANAGER/ADMIN) 누구나 호출 가능합니다.")
	@Parameter(name = "cpage", description = "조회할 페이지 번호(1부터 시작)", example = "1")
	@Parameter(name = "startDate", description = "검색 시작일(yyyy-MM-dd), endDate와 함께 지정해야 적용됨", example = "2026-09-01")
	@Parameter(name = "endDate", description = "검색 종료일(yyyy-MM-dd), startDate와 함께 지정해야 적용됨", example = "2026-09-30")
	@Parameter(name = "searchType", description = "검색 조건 구분(예: 제목/작성자 등 ApprovalDao 조회 조건에 따름)", example = "title")
	@Parameter(name = "keyword", description = "검색 키워드", example = "제주")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "조회 성공 (list: 승인 이력 목록, pageInfo: 페이징 정보)"),
			@ApiResponse(responseCode = "500", description = "로그인 사원 정보를 찾을 수 없는 등 서버 내부 오류")
	})
	@SecurityRequirement(name = "JWT")
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
		Page<WorkcationInfo> pageResult = approvalService.selectApprovalList(authCode, empNo, depId, searchType,
				keyword, startDateTime, endDateTime, pageable);

		int listCount = (int) pageResult.getTotalElements();

		PageInfo pageInfo = Pagination.getPageInfo(listCount, currentPage, 5, 10);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("pageInfo", pageInfo);

		return ResponseEntity.status(HttpStatus.OK).body(map);
	}

	// 승인 이력 상세 조회
	@Operation(summary = "승인 이력 상세 조회", description = "워케이션 번호(workcationNo)로 승인 이력 1건의 상세 정보를 조회합니다.\n\n인증된 사용자(STAFF/MANAGER/ADMIN) 누구나 호출 가능합니다.")
	@Parameter(name = "workcationNo", description = "조회할 워케이션(승인 이력) 번호", required = true, example = "1")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "500", description = "존재하지 않는 워케이션 번호 등 서버 내부 오류")
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/{workcationNo}")
	public ResponseEntity<WorkcationInfo> selectApproval(@PathVariable int workcationNo) {

		WorkcationInfo w = approvalService.selectApproval(workcationNo);

		return ResponseEntity.status(HttpStatus.OK).body(w);
	}

	// 승인 대기 목록 조회
	@Operation(summary = "승인 대기 목록 조회", description = "로그인한 사원의 권한(authCode)·부서(depId)·사번(empNo) 기준으로 승인 대기 상태(A/C/J)인 워케이션 목록을 페이지 단위(페이지당 10건)로 조회합니다. status/searchType/keyword로 추가 검색이 가능하며, startDate/endDate가 모두 주어지면 해당 기간으로 검색 범위를 제한합니다.\n\nSTAFF 권한은 컨트롤러 코드에서 명시적으로 403을 반환하여 차단되며, MANAGER/ADMIN만 실제로 조회할 수 있습니다.")
	@Parameter(name = "cpage", description = "조회할 페이지 번호(1부터 시작)", example = "1")
	@Parameter(name = "startDate", description = "검색 시작일(yyyy-MM-dd), endDate와 함께 지정해야 적용됨", example = "2026-09-01")
	@Parameter(name = "endDate", description = "검색 종료일(yyyy-MM-dd), startDate와 함께 지정해야 적용됨", example = "2026-09-30")
	@Parameter(name = "searchType", description = "검색 조건 구분(예: 제목/작성자 등 ApprovalDao 조회 조건에 따름)", example = "title")
	@Parameter(name = "keyword", description = "검색 키워드", example = "제주")
	@Parameter(name = "status", description = "승인 대기 상태 필터(A/C/J 중 하나)", example = "A")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "조회 성공 (list: 승인 대기 목록, pageInfo: 페이징 정보)"),
			@ApiResponse(responseCode = "403", description = "STAFF 권한은 승인 대기 목록을 조회할 수 없음(컨트롤러에서 명시적으로 차단)"),
			@ApiResponse(responseCode = "500", description = "로그인 사원 정보를 찾을 수 없는 등 서버 내부 오류")
	})
	@SecurityRequirement(name = "JWT")
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

			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
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
		Page<WorkcationInfo> pageResult = approvalService.selectApprovalQueueList(authCode, empNo, depId, status,
				searchType, keyword, startDateTime, endDateTime, pageable);

		int listCount = (int) pageResult.getTotalElements();

		PageInfo pageInfo = Pagination.getPageInfo(listCount, currentPage, 5, 10);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("pageInfo", pageInfo);

		return ResponseEntity.status(HttpStatus.OK).body(map);
	}

	// 승인 대기 상세 조회 (BUG-005 수정: 상태 제한 없이 조회 - ApprovalReject.jsx의
	// 승인/반려 처리 화면이 이 엔드포인트를 사용한다)
	@Operation(summary = "승인 대기 상세 조회", description = "워케이션 번호(workcationNo)로 승인/반려 처리 화면에서 사용할 상세 정보를 조회합니다. 상태(approverState) 제한 없이 조회됩니다(BUG-005 수정).\n\n인증된 사용자(STAFF/MANAGER/ADMIN) 누구나 호출 가능합니다.")
	@Parameter(name = "workcationNo", description = "조회할 워케이션(승인 대기) 번호", required = true, example = "1")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "조회 성공"),
			@ApiResponse(responseCode = "500", description = "존재하지 않는 워케이션 번호 등 서버 내부 오류")
	})
	@SecurityRequirement(name = "JWT")
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
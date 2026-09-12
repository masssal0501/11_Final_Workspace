package com.kh.workflow.workcation.controller;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.task.model.dao.WorkFileDao;
import com.kh.workflow.task.model.vo.WorkFile;
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.service.WorkcationService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// CORS는 SecurityConfig에서 app.cors.allowed-origins 기준으로 중앙 관리한다
// (여기서 개별 @CrossOrigin을 두면 환경별 origin 설정과 어긋날 수 있어 제거함)
@Tag(name = "워케이션 관리", description = "워케이션 신청/목록/상세 조회, 거점(hub) 조회, 지원금 정보, 업무 진행 상황 등록 관련 API (인증된 사용자만 이용 가능)")
@RestController
@RequestMapping("/workcation")
public class WorkcationController {

	@Autowired
	private WorkcationService workcationService;

	@Autowired
	private com.kh.workflow.hub.model.dao.HubDao hubDao;

	@Autowired
	private com.kh.workflow.employee.model.dao.EmployeeDao employeeDao;

	@Autowired
	private WorkcationDao workcationDao;

	@Autowired
	private WorkFileDao workFileDao;

	// 워케이션 목록 조회 (STAFF는 본인 신청 건만, MANAGER는 소속 부서 신청 건만, ADMIN은 전체 조회)
	@Operation(summary = "워케이션 목록 조회", description = "지역/조건/키워드로 검색한 워케이션 신청 목록을 페이징 조회합니다. STAFF는 본인이 신청한 건만, MANAGER는 소속 부서의 신청 건만, ADMIN은 전체를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/list")
	public ResponseEntity<?> selectWorkcationList(
			@Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,
			@Parameter(description = "검색 조건", example = "all")
			@RequestParam(value = "condition", defaultValue = "all") String condition,
			@Parameter(description = "검색 키워드(선택)", example = "")
			@RequestParam(value = "keyword", defaultValue = "") String keyword,
			@Parameter(description = "메인 지역 필터(선택)", example = "제주도")
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@Parameter(description = "검색 대상 유형", example = "all")
			@RequestParam(value = "searchType", defaultValue = "all") String searchType,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {

			return ResponseEntity.status(401).body("로그인이 필요합니다.");
		}

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		int empNo = employee.getEmpNo();

		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		Map<String, Object> paramMap = new HashMap<>();

		paramMap.put("mainRegion", mainRegion);

		paramMap.put("subRegion", subRegion);

		paramMap.put("condition", condition);

		paramMap.put("keyword", keyword);

		paramMap.put("searchType", searchType);

		paramMap.put("empNo", empNo);

		paramMap.put("authCode", employee.getAuthCode());

		paramMap.put("depId", employee.getDepId());

		Page<Map<String, Object>> pageResult = workcationService.selectWorkcationList(paramMap, pageable);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("currentPage", currentPage);

		map.put("totalPages", pageResult.getTotalPages());

		map.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(map);
	}

	@Operation(summary = "내 워케이션 목록 조회", description = "로그인한 본인이 신청한 워케이션 목록을 지역/검색 조건으로 페이징 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/mylist")
	public ResponseEntity<?> selectMyWorkcationList(
			@Parameter(description = "조회할 페이지 번호(1부터 시작)", example = "1")
			@RequestParam(value = "cpage", defaultValue = "1") int currentPage,
			@Parameter(description = "메인 지역 필터(선택)", example = "제주도")
			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
			@Parameter(description = "세부 지역 필터(선택)", example = "서귀포시")
			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,
			@Parameter(description = "검색 대상 유형", example = "all")
			@RequestParam(value = "searchType", defaultValue = "all") String searchType,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {

			return ResponseEntity.status(401).body("로그인이 필요합니다.");
		}

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		int empNo = employee.getEmpNo();

		Pageable pageable = PageRequest.of(currentPage - 1, 10);

		Map<String, Object> paramMap = new HashMap<>();

		paramMap.put("empNo", empNo);

		paramMap.put("mainRegion", mainRegion);

		paramMap.put("subRegion", subRegion);

		paramMap.put("searchType", searchType);

		Page<Map<String, Object>> pageResult = workcationService.selectMyWorkcationList(paramMap, pageable);

		Map<String, Object> result = new HashMap<>();

		result.put("list", pageResult.getContent());

		result.put("currentPage", currentPage);

		result.put("totalPages", pageResult.getTotalPages());

		result.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(result);
	}

	@Operation(summary = "내 워케이션 상세 조회", description = "로그인한 본인이 신청한 워케이션의 상세 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/mydetail/{workcationNo}")
	public ResponseEntity<?> getMyWorkcationDetail(
			@Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
			@PathVariable Integer workcationNo,
			Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {

			return ResponseEntity.status(401).body("로그인이 필요합니다.");
		}

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		Map<String, Object> result = workcationService.getMyWorkcationDetail(workcationNo, employee.getEmpNo());

		return ResponseEntity.ok(result);
	}

	@Operation(summary = "워케이션 신청용 거점 목록 조회", description = "워케이션 신청 화면에서 지역/유형 조건으로 선택 가능한 거점(hub) 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/list")
	public ResponseEntity<?> selectHubList(
	        @RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,
	        @RequestParam(value = "subRegion", defaultValue = "") String subRegion,
	        @RequestParam(value = "hubType", defaultValue = "0") int hubType) {

	    List<com.kh.workflow.hub.model.vo.Hub> list =
	            hubDao.findByMainRegionAndSubRegionAndHubType(
	                    mainRegion,
	                    subRegion,
	                    hubType
	            );

	    List<Map<String, Object>> result = list.stream()
	            .map(hub -> {
	                Map<String, Object> map = new HashMap<>();

	                map.put("hubNo", hub.getHubNo());
	                map.put("hubName", hub.getHubName());
	                map.put("hubAddress", hub.getHubAddress());
	                map.put("hubType", hub.getHubType());
	                map.put("mainRegion", hub.getMainRegion());
	                map.put("subRegion", hub.getSubRegion());
	                map.put("price", hub.getPrice());
	                map.put("hubStatus", hub.getHubStatus());
	                map.put("maxCapacity", hub.getMaxCapacity());
	                map.put("phone", hub.getPhone());
	                map.put("description", hub.getDescription());

	                return map;
	            })
	            .toList();

	    return ResponseEntity.ok(result);
	}
	// 메인지역 드롭에 따른 목록 조회
	@Operation(summary = "메인 지역 드롭다운 목록 조회", description = "워케이션 신청/검색 화면의 메인 지역 드롭다운을 채우기 위한 지역명 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/mainRegion")
	public ResponseEntity<List<String>> getMainRegionList() {
		List<String> list = hubDao.selectMainRegionList();
		return ResponseEntity.ok(list);
	}

	// 상세지역 드롭에 따른 목록 조회
	@Operation(summary = "세부 지역 드롭다운 목록 조회", description = "선택한 메인 지역에 속한 세부 지역명 목록을 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/hub/subRegion")
	public ResponseEntity<List<String>> getSubRegionList(
			@Parameter(description = "세부 지역을 조회할 메인 지역명", example = "제주도", required = true)
			@RequestParam String mainRegion) {
		List<String> list = hubDao.selectSubRegionList(mainRegion);
		return ResponseEntity.ok(list);
	}

	// 워케이션 신청등록 폼
	@Operation(summary = "워케이션 신청 등록", description = "선택한 거점/기간 등 정보를 바탕으로 새 워케이션 신청서를 등록합니다. 관리자(ADMIN) 계정은 신청할 수 없습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "신청 완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
		@ApiResponse(responseCode = "403", description = "관리자 계정은 신청 불가", content = @Content)
	})
	@PostMapping("/hub/enrollForm")
	public ResponseEntity<String> insertWorkcationEnrollForm(
	        @RequestBody Map<String, Object> paramMap,
	        Authentication authentication) {

	    try {

	        System.out.println("===== 워케이션 신청 요청 시작 =====");
	        System.out.println("받은 데이터 : " + paramMap);

	        String empId = (String) authentication.getPrincipal();

	        System.out.println("로그인 empId : " + empId);

	        Employee employee = employeeDao.findByEmpId(empId)
	                .orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

	        System.out.println("로그인 empNo : " + employee.getEmpNo());
	        System.out.println("권한 : " + employee.getAuthCode());

	        if ("ADMIN".equals(employee.getAuthCode())) {
	            return ResponseEntity
	                    .status(403)
	                    .body("관리자계정으로는 신청할 수 없습니다.");
	        }

	        int empNo = employee.getEmpNo();

	        paramMap.put("empNo", empNo);

	        System.out.println("서비스 전달 데이터 : " + paramMap);

	        workcationService.insertWorkcationEnrollForm(paramMap);

	        System.out.println("===== 워케이션 신청 성공 =====");

	        return ResponseEntity.ok("신청 완료");

	    } catch (Exception e) {

	        System.err.println("===== 워케이션 신청 실패 =====");
	        System.err.println("에러 타입 : " + e.getClass().getName());
	        System.err.println("에러 메시지 : " + e.getMessage());

	        e.printStackTrace();

	        return ResponseEntity
	                .status(500)
	                .body("신청 실패 : " + e.getMessage());
	    }
	}

	// 회사 지원금 정보 조회 API추가
	@Operation(summary = "회사 지원금 정보 조회", description = "워케이션 신청 시 안내되는 회사 지원금(1인당 지원 한도 등) 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/amount/supportInfo")
	public ResponseEntity<Map<String, Object>> getAmountSupportInfo() {
		Map<String, Object> supportInfo = workcationService.getAmountSupportInfo();
		return ResponseEntity.ok(supportInfo);
	}

	// 워케이션 상세 조회 + 로그인 사용자 기준 수정/삭제 가능 여부 계산
	@Operation(summary = "워케이션 상세 조회", description = "워케이션 번호로 신청/승인/거점 등 상세 정보를 조회합니다. 응답에 로그인한 사용자 기준 수정(canUpdate)/삭제(canDelete) 가능 여부가 포함됩니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/detail/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getWorkcationDetail(
			@Parameter(description = "조회할 워케이션 번호", example = "1", required = true)
			@PathVariable("workcationNo") Integer workcationNo,
			Authentication authentication) {

		Map<String, Object> detail = workcationService.getWorkcationDetail(workcationNo);

		String empId = (String) authentication.getPrincipal();

		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		Integer writerEmpNo = (Integer) detail.get("writerEmpNo");

		String authCode = loginEmployee.getAuthCode();

		boolean isMine = writerEmpNo != null && writerEmpNo.equals(loginEmployee.getEmpNo());

		boolean canUpdate = false;
		boolean canDelete = false;

		// STAFF / MANAGER : 본인 글만 수정/삭제 가능
		if ("STAFF".equals(authCode) || "MANAGER".equals(authCode)) {

			canUpdate = isMine;
			canDelete = isMine;
		}

		// ADMIN : 모든 글 수정 가능, 삭제는 불가능
		if ("ADMIN".equals(authCode)) {

			canUpdate = true;
			canDelete = false;
		}

		detail.put("canUpdate", canUpdate);
		detail.put("canDelete", canDelete);

		return ResponseEntity.ok(detail);
	}

	// 워케이션 수정 (실제 수정 권한 검사 포함)
	@Operation(summary = "워케이션 정보 수정", description = "워케이션 신청 정보를 수정합니다. STAFF/MANAGER는 본인 신청 건만, ADMIN은 모든 건을 수정할 수 있습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "수정완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
		@ApiResponse(responseCode = "403", description = "수정 권한 없음", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PutMapping("/update/{workcationNo}")
	public ResponseEntity<?> update(
			@Parameter(description = "수정할 워케이션 번호", example = "1", required = true)
			@PathVariable Integer workcationNo,
			@Parameter(description = "수정할 워케이션 정보(키-값 쌍)", required = true)
			@RequestBody Map<String, Object> updateData,
			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new RuntimeException("워케이션 정보를 찾을 수 없습니다."));

		// 실제 수정 권한 검사 - 프런트엔드에서 버튼이 안 보이는 것과는 별개로,
		// API를 직접 호출하는 경우까지 막기 위해 서버에서도 검증한다.
		if (!canUpdateWorkcation(workcation, loginEmployee)) {

			return ResponseEntity.status(403).body("수정 권한이 없습니다.");
		}

		workcationService.updateWorkcation(workcationNo, updateData);

		return ResponseEntity.ok("수정완료");
	}

	// 워케이션 삭제 (실제 삭제 권한 검사 포함)
	@Operation(summary = "워케이션 삭제", description = "워케이션 신청 건을 삭제합니다. STAFF/MANAGER는 본인 신청 건만 삭제할 수 있고, ADMIN은 삭제할 수 없습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "삭제완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
		@ApiResponse(responseCode = "403", description = "삭제 권한 없음", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@DeleteMapping("/delete/{workcationNo}")
	public ResponseEntity<?> deleteWorkcation(
			@Parameter(description = "삭제할 워케이션 번호", example = "1", required = true)
			@PathVariable("workcationNo") Integer workcationNo,
			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new RuntimeException("워케이션 정보를 찾을 수 없습니다."));

		// 실제 삭제 권한 검사
		if (!canDeleteWorkcation(workcation, loginEmployee)) {

			return ResponseEntity.status(403).body("삭제 권한이 없습니다.");
		}

		workcationService.deleteWorkcation(workcationNo);

		return ResponseEntity.ok("삭제완료");
	}

	// 수정 권한 검사 - STAFF/MANAGER는 본인 글만, ADMIN은 모든 글
	private boolean canUpdateWorkcation(WorkcationInfo workcation, Employee loginEmployee) {

		String authCode = loginEmployee.getAuthCode();

		boolean isMine = workcation.getEmployee() != null
				&& workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

		if ("STAFF".equals(authCode) || "MANAGER".equals(authCode)) {
			return isMine;
		}

		if ("ADMIN".equals(authCode)) {
			return true;
		}

		return false;
	}

	// 삭제 권한 검사 - STAFF/MANAGER는 본인 글만, ADMIN은 삭제 불가
	private boolean canDeleteWorkcation(WorkcationInfo workcation, Employee loginEmployee) {

		String authCode = loginEmployee.getAuthCode();

		boolean isMine = workcation.getEmployee() != null
				&& workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

		if ("STAFF".equals(authCode) || "MANAGER".equals(authCode)) {
			return isMine;
		}

		return false;
	}

	@Operation(summary = "워케이션 업무 진행 상황 저장", description = "워케이션 중 수행한 업무의 진행률/제목/내용을 저장하고, 증빙 파일을 함께 첨부할 수 있습니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "업무 진행 상황 저장 완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PutMapping("/task/{taskNo}")
	public ResponseEntity<?> updateTask(
			@Parameter(description = "업무 번호", example = "1", required = true)
			@PathVariable Integer taskNo,
			@Parameter(description = "업무 진행률(%)", example = "50", required = true)
			@RequestParam Integer progress,
			@Parameter(description = "업무 제목", example = "1주차 업무 보고서", required = true)
			@RequestParam String title,
			@Parameter(description = "업무 내용", example = "이번 주 진행한 업무 내용입니다.", required = true)
			@RequestParam String content,
			@Parameter(description = "업무 증빙 첨부파일(선택)")
			@RequestParam(required = false) MultipartFile file) {

		workcationService.updateTask(taskNo, progress, title, content, file);
		return ResponseEntity.ok("업무 진행 상황 저장 완료");
	}

	// 워케이션 일정(내 일정/부서 일정) 조회
	@Operation(summary = "워케이션 일정 조회", description = "선택한 날짜 기준으로 로그인한 사용자 본인의 일정과 소속 부서의 일정을 함께 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/schedule")
	public ResponseEntity<?> getWorkcationSchedule(
			@Parameter(description = "조회할 날짜(yyyy-MM-dd)", example = "2026-09-10", required = true)
			@RequestParam String date,
			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		LocalDate selectedDate = LocalDate.parse(date);

		Map<String, Object> result = workcationService.getWorkcationSchedule(selectedDate, employee.getEmpNo());

		return ResponseEntity.ok(result);
	}

	// 업무 증빙/첨부파일 다운로드
	@Operation(summary = "업무 첨부파일 다운로드", description = "업무 진행 상황 저장 시 첨부한 파일을 다운로드합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "다운로드 성공"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content),
		@ApiResponse(responseCode = "404", description = "파일을 찾을 수 없음", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@GetMapping("/file/{taskFileNo}/download")
	public ResponseEntity<Resource> downloadWorkFile(
			@Parameter(description = "다운로드할 첨부파일 번호", example = "1", required = true)
			@PathVariable Integer taskFileNo) {

		WorkFile workFile = workFileDao.findById(taskFileNo)
				.orElseThrow(() -> new RuntimeException("첨부파일을 찾을 수 없습니다."));

		File file = new File(System.getProperty("user.dir") + workFile.getFilePath() + workFile.getChangeName());

		if (!file.exists()) {
			return ResponseEntity.notFound().build();
		}

		Resource resource = new FileSystemResource(file);

		String encodedName = URLEncoder.encode(workFile.getOriginName(), StandardCharsets.UTF_8).replace("+", "%20");

		return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM)
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName).body(resource);
	}

	// 워케이션 업무 첨부파일 등록
	@Operation(summary = "워케이션 업무 첨부파일 등록", description = "워케이션에 속한 업무의 증빙 파일을 추가로 업로드합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "첨부파일 등록 완료"),
		@ApiResponse(responseCode = "401", description = "인증 실패(로그인 필요)", content = @Content)
	})
	@SecurityRequirement(name = "JWT")
	@PostMapping("/{workcationNo}/file")
	public ResponseEntity<?> uploadWorkFile(
			@Parameter(description = "워케이션 번호", example = "1", required = true)
			@PathVariable Integer workcationNo,
			@Parameter(description = "업로드할 첨부파일", required = true)
			@RequestParam MultipartFile file) {

		workcationService.uploadWorkFile(workcationNo, file);

		return ResponseEntity.ok("첨부파일 등록 완료");
	}

}

package com.kh.workflow.workcation.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.kh.workflow.workcation.model.dao.WorkcationDao;
import com.kh.workflow.workcation.model.service.WorkcationService;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
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

	// 워케이션 전체 목록 조회
	// STAFF / MANAGER / ADMIN 모두 조회 가능
	@GetMapping("/list")
	public ResponseEntity<?> selectWorkcationList(@RequestParam(value = "cpage", defaultValue = "1") int currentPage,

			@RequestParam(value = "condition", defaultValue = "all") String condition,

			@RequestParam(value = "keyword", defaultValue = "") String keyword,

			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,

			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,

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

		Page<Map<String, Object>> pageResult = workcationService.selectWorkcationList(paramMap, pageable);

		Map<String, Object> map = new HashMap<>();

		map.put("list", pageResult.getContent());

		map.put("currentPage", currentPage);

		map.put("totalPages", pageResult.getTotalPages());

		map.put("totalElements", pageResult.getTotalElements());

		return ResponseEntity.ok(map);
	}

	// 내 워케이션 목록 조회
	@GetMapping("/mylist")
	public ResponseEntity<?> selectMyWorkcationList(@RequestParam(value = "cpage", defaultValue = "1") int currentPage,

			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,

			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,

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

	// 내 워케이션 상세 조회
	@GetMapping("/mydetail/{workcationNo}")
	public ResponseEntity<?> getMyWorkcationDetail(@PathVariable Integer workcationNo, Authentication authentication) {

		if (authentication == null || !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {

			return ResponseEntity.status(401).body("로그인이 필요합니다.");
		}

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		Map<String, Object> result = workcationService.getMyWorkcationDetail(workcationNo, employee.getEmpNo());

		return ResponseEntity.ok(result);
	}

	// 거점 목록 조회
	@GetMapping("/hub/list")
	public ResponseEntity<List<com.kh.workflow.hub.model.vo.Hub>> selectHubList(

			@RequestParam(value = "mainRegion", defaultValue = "") String mainRegion,

			@RequestParam(value = "subRegion", defaultValue = "") String subRegion,

			@RequestParam(value = "hubType", defaultValue = "0") int hubType) {

		List<com.kh.workflow.hub.model.vo.Hub> list = hubDao.findByMainRegionAndSubRegionAndHubType(mainRegion,
				subRegion, hubType);

		return ResponseEntity.ok(list);
	}

	// 메인 지역 목록
	@GetMapping("/hub/mainRegion")
	public ResponseEntity<List<String>> getMainRegionList() {

		List<String> list = hubDao.selectMainRegionList();

		return ResponseEntity.ok(list);
	}

	// 상세 지역 목록
	@GetMapping("/hub/subRegion")
	public ResponseEntity<List<String>> getSubRegionList(@RequestParam String mainRegion) {

		List<String> list = hubDao.selectSubRegionList(mainRegion);

		return ResponseEntity.ok(list);
	}

	// 워케이션 신청
	@PostMapping("/hub/enrollForm")
	public ResponseEntity<String> insertWorkcationEnrollForm(

			@RequestBody Map<String, Object> paramMap,

			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		/*
		 * 기존 코드 유지. 다만 네 담당이 수정/삭제 권한만이라면 ADMIN 신청 제한 또한 다른 담당자 정책에 따라 제거해도 됨.
		 */
		if ("ADMIN".equals(employee.getAuthCode())) {

			return ResponseEntity.status(403).body("관리자계정으로는 신청할 수 없습니다.");
		}

		int empNo = employee.getEmpNo();

		paramMap.put("empNo", empNo);

		workcationService.insertWorkcationEnrollForm(paramMap);

		return ResponseEntity.ok("신청 완료");
	}

	// 회사 지원금 조회
	@GetMapping("/amount/supportInfo")
	public ResponseEntity<Map<String, Object>> getAmountSupportInfo() {

		Map<String, Object> supportInfo = workcationService.getAmountSupportInfo();

		return ResponseEntity.ok(supportInfo);
	}

	// 워케이션 상세 조회
	// 수정/삭제 버튼 권한 계산
	@GetMapping("/detail/{workcationNo}")
	public ResponseEntity<Map<String, Object>> getWorkcationDetail(

			@PathVariable Integer workcationNo,

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

		// STAFF
		// 본인 글만 수정/삭제 가능
		if ("STAFF".equals(authCode)) {

			canUpdate = isMine;
			canDelete = isMine;
		}

		// MANAGER (부서장)
		// 본인 글만 수정/삭제 가능
		if ("MANAGER".equals(authCode)) {

			canUpdate = isMine;
			canDelete = isMine;
		}

		// ADMIN
		// 모든 글 수정 가능
		// 삭제는 불가능
		if ("ADMIN".equals(authCode)) {

			canUpdate = true;
			canDelete = false;
		}

		detail.put("canUpdate", canUpdate);

		detail.put("canDelete", canDelete);

		return ResponseEntity.ok(detail);
	}

	// 워케이션 수정
	@PutMapping("/update/{workcationNo}")
	public ResponseEntity<?> update(

			@PathVariable Integer workcationNo,

			@RequestBody Map<String, Object> updateData,

			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		WorkcationInfo workcation = workcationDao.findById(workcationNo)
				.orElseThrow(() -> new RuntimeException("워케이션 정보를 찾을 수 없습니다."));

		// 실제 수정 권한 검사
		if (!canUpdateWorkcation(workcation, loginEmployee)) {

			return ResponseEntity.status(403).body("수정 권한이 없습니다.");
		}

		workcationService.updateWorkcation(workcationNo, updateData);

		return ResponseEntity.ok("수정완료");
	}

	// 워케이션 삭제
	@DeleteMapping("/delete/{workcationNo}")
	public ResponseEntity<?> deleteWorkcation(

			@PathVariable Integer workcationNo,

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

	// 수정 권한 검사
	private boolean canUpdateWorkcation(WorkcationInfo workcation, Employee loginEmployee) {

		String authCode = loginEmployee.getAuthCode();

		boolean isMine = workcation.getEmployee() != null
				&& workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

		// STAFF : 본인 글
		if ("STAFF".equals(authCode)) {
			return isMine;
		}

		// MANAGER : 본인 글
		if ("MANAGER".equals(authCode)) {
			return isMine;
		}

		// ADMIN : 모든 글
		if ("ADMIN".equals(authCode)) {
			return true;
		}

		return false;
	}

	// 삭제 권한 검사
	private boolean canDeleteWorkcation(WorkcationInfo workcation, Employee loginEmployee) {

		String authCode = loginEmployee.getAuthCode();

		boolean isMine = workcation.getEmployee() != null
				&& workcation.getEmployee().getEmpNo().equals(loginEmployee.getEmpNo());

		if ("STAFF".equals(authCode) || "MANAGER".equals(authCode)) {
			return isMine;
		}

		return false;
	}

	// 업무 진행 상황 저장
	@PutMapping("/task/{taskNo}")
	public ResponseEntity<?> updateTask(

			@PathVariable Integer taskNo,

			@RequestParam Integer progress,

			@RequestParam String title,

			@RequestParam String content,

			@RequestParam(required = false) MultipartFile file) {

		workcationService.updateTask(taskNo, progress, title, content, file);

		return ResponseEntity.ok("업무 진행 상황 저장 완료");
	}

	// 워케이션 일정
	@GetMapping("/schedule")
	public ResponseEntity<?> getWorkcationSchedule(

			@RequestParam String date,

			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee employee = employeeDao.findByEmpId(empId).orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		LocalDate selectedDate = LocalDate.parse(date);

		Map<String, Object> result = workcationService.getWorkcationSchedule(selectedDate, employee.getEmpNo());

		return ResponseEntity.ok(result);
	}
}

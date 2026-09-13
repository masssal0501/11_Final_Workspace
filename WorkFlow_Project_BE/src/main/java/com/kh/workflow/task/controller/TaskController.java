package com.kh.workflow.task.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;
import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.task.model.service.TaskService;
import com.kh.workflow.task.model.vo.Task;

@RestController
@RequestMapping("/task")
public class TaskController {

	@Autowired
	private TaskService taskService;

	@Autowired
	private TaskDao taskDao;

	@Autowired
	private EmployeeDao employeeDao;

	// 목록
	@GetMapping("/list")
	public ResponseEntity<?> selectTaskList(@RequestParam(value = "cpage", defaultValue = "1") int cpage,
			@RequestParam(value = "condition", defaultValue = "all") String condition,
			@RequestParam(value = "keyword", defaultValue = "") String keyword) {

		Pageable pageable = PageRequest.of(cpage - 1, 10);

		Page<Map<String, Object>> result = taskService.selectTaskBoardList(keyword, pageable);

		return ResponseEntity.ok(result);
	}

	// 상세
	@GetMapping("/detail/{taskNo}")
	public ResponseEntity<?> selectTaskDetail(@PathVariable Integer taskNo) {
		return ResponseEntity.ok(taskService.selectTaskDetail(taskNo));
	}

	@GetMapping("/workcation/{workcationNo}")
	public ResponseEntity<?> selectWorkcationTasks(@PathVariable Integer workcationNo) {
	    return ResponseEntity.ok(taskService.selectWorkcationTasks(workcationNo));
	}

	// BUG-13: SecurityConfig의 URL 규칙(hasAnyRole("MANAGER","ADMIN"))만으로는
	// "부서장은 자신의 부서 업무만" 이라는 조건을 표현할 수 없어, 지금까지 이 메서드에
	// Authentication 파라미터조차 없이 어떤 MANAGER든 다른 부서의 업무까지 승인/거부할
	// 수 있는 구조였다. ADMIN은 전체, MANAGER는 업무 소유자(워케이션 신청자)와 같은
	// 부서일 때만 검토할 수 있도록 여기서 직접 검증한다.
	@PatchMapping("/{taskNo}/status")
	public ResponseEntity<?> updateTaskStatus(
			@PathVariable Integer taskNo,
			@RequestBody Map<String, String> data,
			Authentication authentication) {

		String empId = (String) authentication.getPrincipal();

		Employee loginEmployee = employeeDao.findByEmpId(empId)
				.orElseThrow(() -> new RuntimeException("회원 정보를 찾을 수 없습니다."));

		Task task = taskDao.findById(taskNo)
				.orElseThrow(() -> new IllegalArgumentException("업무를 찾을 수 없습니다."));

		Employee owner = task.getWork().getWorkcationInfo().getEmployee();

		if (!canReviewTask(owner, loginEmployee)) {
			throw new AccessDeniedException("해당 업무를 검토할 권한이 없습니다.");
		}

		taskService.updateTaskStatus(taskNo, data.get("status"), data.get("content"));

		return ResponseEntity.ok("상태 변경 완료");
	}

	// 업무 완료 검토 권한 검사 - ADMIN은 전체, MANAGER는 업무 소유자(워케이션 신청자)와
	// 같은 부서 소속일 때만 가능. STAFF는 URL 단계(SecurityConfig)에서 이미 차단되지만,
	// 혹시라도 권한 규칙이 바뀌더라도 이 메서드만으로 안전하도록 STAFF는 명시적으로 거부한다.
	private boolean canReviewTask(Employee owner, Employee loginEmployee) {

		String authCode = loginEmployee.getAuthCode();

		if ("ADMIN".equals(authCode)) {
			return true;
		}

		if ("MANAGER".equals(authCode)) {
			return owner.getDepId() != null && owner.getDepId().equals(loginEmployee.getDepId());
		}

		return false;
	}
}
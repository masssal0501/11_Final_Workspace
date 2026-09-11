package com.kh.workflow.attendance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.attendance.model.service.AttendanceService;
import com.kh.workflow.attendance.model.vo.Attendance;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.employee.model.vo.Employee;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Attendance API", description = "근태(출근/퇴근) 위치 인증 관련 API")
@RestController
@RequestMapping("/attendance")
public class AttendanceController {

	@Autowired
	private AttendanceService attendanceService;

	@Autowired
	private EmployeeDao employeeDao;

	public static class CheckRequest {
		public Integer workcationNo;
		public Integer hubNo;
		public String checkType; // "IN" or "OUT"
		public Double latitude;
		public Double longitude;
		public Integer distanceM;
	}

	@Operation(summary = "출근/퇴근 처리", description = "위치 인증(LocationCheckModal)을 통과한 뒤 실제 출근/퇴근 기록을 저장합니다.")
	@SecurityRequirement(name = "JWT")
	@PostMapping("/check")
	public ResponseEntity<Attendance> checkAttendance(@RequestBody CheckRequest request,
			Authentication authentication) {

		Employee employee = employeeDao.findByEmpId(authentication.getName())
				.orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다."));

		Attendance saved = attendanceService.checkAttendance(employee.getEmpNo(), request.workcationNo,
				request.hubNo, request.checkType, request.latitude, request.longitude, request.distanceM);

		return ResponseEntity.status(HttpStatus.OK).body(saved);
	}
}

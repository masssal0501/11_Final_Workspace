package com.kh.workflow.dashboard.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.dashboard.model.service.DashboardService;

@CrossOrigin
@RestController
public class DashboardController {
	
	@Autowired
	private DashboardService dashboardService;
	
	@GetMapping("/dashboard/admin")
	public ResponseEntity<AdminDto> selectAdminDashboard() {
		AdminDto adminDto = dashboardService.selectAdminDashboard();
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(adminDto);
	}
	
	@GetMapping("/dashboard/manager/{depId}")
	public ResponseEntity<ManagerDto> selectManagerDashboard(@PathVariable String depId) {
		ManagerDto managerDto = dashboardService.selectManagerDashboard(depId);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(managerDto);
	}
	
	@GetMapping("/dashboard/manager/{depId}/workcation")
	public ResponseEntity<WorkcationListDto> selectManagerWorkcationList(@PathVariable String depId, String keyword, LocalDate startAt, LocalDate endAt) {
		
		LocalDateTime startDate = (startAt != null) ? startAt.atStartOfDay() : null;
	    LocalDateTime endDate = (endAt != null) ? endAt.atTime(LocalTime.MAX) : null;
		
		WorkcationListDto workcationListDto = dashboardService.selectManagerWorkcationList(depId, keyword, startDate, endDate);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(workcationListDto);
	}
	
	@GetMapping("/dashboard/staff/{empNo}")
	public ResponseEntity<StaffDto> selectStaffDashboard(@PathVariable int empNo) {
		StaffDto staffDto = dashboardService.selectStaffDashboard(empNo);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(staffDto);
	}
}
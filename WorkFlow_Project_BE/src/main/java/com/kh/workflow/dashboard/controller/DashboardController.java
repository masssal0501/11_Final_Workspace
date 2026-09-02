package com.kh.workflow.dashboard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.service.DashboardService;

@CrossOrigin
@RestController
public class DashboardController {
	
	@Autowired
	private DashboardService dashboardService;
	
	@GetMapping("/dashboard/admin")
	public ResponseEntity<AdminDto> selectAdminDashBoard() {
		AdminDto adminDto = dashboardService.selectAdminDashboard();
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(adminDto);
	}
	
	@GetMapping("/dashboard/manager/{depId}")
	public ResponseEntity<ManagerDto> selectManagerDashBoard(@PathVariable String depId ) {
		ManagerDto managerDto = dashboardService.selectManagerDashboard(depId);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(managerDto);
	}
}
package com.kh.workflow.dashboard.model.service;

import java.time.LocalDateTime;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;

public interface DashboardService {

	AdminDto selectAdminDashboard();

	ManagerDto selectManagerDashboard(String depId);

	WorkcationListDto selectManagerWorkcationList(String depId, String keyword, LocalDateTime startDate, LocalDateTime endDate);

	StaffDto selectStaffDashboard(int empNo);
	
}
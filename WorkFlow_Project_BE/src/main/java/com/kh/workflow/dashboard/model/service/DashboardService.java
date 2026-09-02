package com.kh.workflow.dashboard.model.service;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;

public interface DashboardService {

	AdminDto selectAdminDashboard();

	ManagerDto selectManagerDashboard(String depId);
	
}
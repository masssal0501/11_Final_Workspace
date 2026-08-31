package com.kh.workflow.dashboard.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.workcation.model.dao.WorkcationDao;

@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
	private WorkcationDao workcationDao;
	
	@Autowired
	private HubDao hubDao;
	
	@Override
	public AdminDto selectAdminDashboard() {
		AdminDto adminDto = new AdminDto();
		
		adminDto.setTotalApply(workcationDao.countTotalApply());
		adminDto.setWaiting(workcationDao.countWaiting());
		adminDto.setInProgress(workcationDao.countInProgress());
		
		adminDto.setTotalParticipants(workcationDao.countTotalParticipants());
		
		adminDto.setWaitingList(workcationDao.selectWaitingList());
		adminDto.setShareData(hubDao.HubShareList());
		
		System.out.println(adminDto.getShareData());
		
		return adminDto;
	}

}
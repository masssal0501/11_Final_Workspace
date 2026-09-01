package com.kh.workflow.dashboard.model.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.workcation.model.dao.WorkcationDao;

@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
	private WorkcationDao workcationDao;
	
	@Autowired
	private HubDao hubDao;
	
	@Autowired
	private AmountDao amountDao;
	
	@Override
	public AdminDto selectAdminDashboard() {
		AdminDto adminDto = new AdminDto();
		
		// 총 신청 건수
		adminDto.setTotalApply(workcationDao.countTotalApply());
		
		// 승인 대기
		adminDto.setWaiting(workcationDao.countWaiting());
		
		// 현재 진행중
		adminDto.setInProgress(workcationDao.countInProgress());
		
		// 예산 소진율
		adminDto.setBudgetExhaustionRate(amountDao.selectBudgetExhaustionRate());		
		
		// 총 참여 인원
		adminDto.setTotalParticipants(workcationDao.countTotalParticipants());
		
		// 총 집행 예산
		adminDto.setTotalBudget(amountDao.selectTotalBudget());
		
		// 평균 만족도
		adminDto.setAvgSatisfaction(workcationDao.selectAvgSatisfaction());
		
		// 평균 워케이션 기간
		adminDto.setAvgDuration(workcationDao.selectAvgDuration());
		
		// 보유 지원금
		adminDto.setSupportFund(amountDao.selectSupportFund());
		
		// 워케이션 이용률
		adminDto.setUsageRate(workcationDao.selectUsageRate());
		
		// 승인대기 목록
		adminDto.setWaitingList(workcationDao.selectWaitingList());
		
		// 거점 오피스별 점유율
		adminDto.setShareData(hubDao.HubShareData());

		// 월별 참가 현황 데이터
		adminDto.setMonthlyData(workcationDao.selectMonthlyData(LocalDateTime.now().minusMonths(6)));
		
		return adminDto;
	}

}
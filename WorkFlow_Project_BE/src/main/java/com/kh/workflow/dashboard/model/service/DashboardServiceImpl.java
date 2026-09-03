package com.kh.workflow.dashboard.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.mybatis.spring.SqlSessionTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.notice.dao.NoticeDao;
import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.workcation.model.dao.WorkcationDao;

@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
	private WorkcationDao workcationDao;
	
	@Autowired
	private HubDao hubDao;
	
	@Autowired
	private AmountDao amountDao;
	
	@Autowired
	private NoticeDao noticeDao;
	
	@Autowired
	private EmployeeDao employeeDao;

	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private SqlSessionTemplate sqlSession;

	@Override
	public AdminDto selectAdminDashboard() {
		AdminDto adminDto = new AdminDto();
		
		// (이번달)총 신청 건수
		adminDto.setTotalApply(workcationDao.adminCountTotalApply());
		
		// (이번달)승인 대기
		adminDto.setWaiting(workcationDao.adminCountWaiting());
		
		// (이번달)현재 진행중
		adminDto.setInProgress(workcationDao.adminCountInProgress());
		
		// (이번달)예산 소진율
		adminDto.setBudgetExhaustionRate(amountDao.adminSelectBudgetExhaustionRate());		
		
		// 총 참여 인원
		adminDto.setTotalParticipants(workcationDao.countTotalParticipants());
		
		// 회사 부담금
		adminDto.setTotalBudget(amountDao.selectTotalBudget());
		
		// 평균 만족도
		adminDto.setAvgSatisfaction(workcationDao.selectAvgSatisfaction());
		
		// 평균 워케이션 기간
		adminDto.setAvgDuration(workcationDao.selectAvgDuration());
		
		// 보유 지원금
		adminDto.setSupportFund(amountDao.selectSupportFund());
		
		// 워케이션 이용률
		adminDto.setUsageRate(workcationDao.selectUsageRate());
		
		// 총 비용
		adminDto.setTotalCost(amountDao.selectTotalCost());
		
		// (관리자)승인대기 목록
		adminDto.setWaitingList(workcationDao.adminSelectWaitingList());
		
		// (관리자)지역별 이용 통계
		adminDto.setRegionData(workcationDao.adminSelectRegionData());
		
		// 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0); // 시작 행 (0부터)
		map.put("limit", 3);
		adminDto.setNoticeData(noticeDao.selectNoticeList(sqlSession, map));
		
		// 월별 참가 현황 데이터
		adminDto.setMonthlyData(workcationDao.selectMonthlyData(LocalDateTime.now().minusMonths(6)));
				
		// 거점 오피스별 점유율
		adminDto.setShareData(hubDao.HubShareData());
		
		// 총 예산 대비 집행률
		adminDto.setBudgetData(amountDao.selectBudgetData());
		
		// 항목별 지출 비중
		adminDto.setCategoryData(amountDao.selectCategoryData());
		
		// 부서별 사용 예산
		adminDto.setDeptData(amountDao.selectDeptData());
		
		return adminDto;
	}

	@Override
	public ManagerDto selectManagerDashboard(String depId) {
		ManagerDto managerDto = new ManagerDto();
		
		// 부서명 조회
		managerDto.setDepTitle(employeeDao.selectDepTitle(depId));
		
		// (부서)총 신청 건수
		managerDto.setTotalApply(workcationDao.managerCountTotalApply(depId));
		
		// (부서)승인 대기
		managerDto.setWaiting(workcationDao.managerCountWaiting(depId));
		
		// (부서)현재 진행중
		managerDto.setInProgress(workcationDao.managerCountInProgress(depId));
		
		// (부서)예산 소진율
		managerDto.setBudgetExhaustionRate(amountDao.managerSelectBudgetExhaustionRate(depId));
		
		// 부서 평균업무 진행률
		managerDto.setAvgProgressRate(taskDao.AvgProgressRate(depId));
		
		// (부서)승인대기 목록
		managerDto.setWaitingList(workcationDao.managerSelectWaitingList(depId));
		
		// (부서)지역별 이용 통계
		managerDto.setRegionData(workcationDao.managerSelectRegionData(depId));
				
		// 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0);
		map.put("limit", 3);
		managerDto.setNoticeData(noticeDao.selectNoticeList(sqlSession, map));
		
		// 정산대기 목록
		managerDto.setBalanceList(amountDao.selectBalanceList(depId));
		
		// 부서 워케이션 목록
		managerDto.setWorkcationList(workcationDao.managerSelectWorkcationList(depId));
		
		return managerDto;
	}

	@Override
	public WorkcationListDto selectManagerWorkcationList(String depId, String keyword, LocalDateTime startDate, LocalDateTime endDate) {
		
		return workcationDao.managerSearchWorkcationList(depId, keyword, startDate, endDate);
	}

	@Override
	public StaffDto selectStaffDashboard(int empNo) {
		StaffDto staffDto = new StaffDto();
		
		// 워케이션 간 횟수
		staffDto.setWorkcationCount(workcationDao.selectWorkcationCount(empNo));
		
		// 남은 지원금
		staffDto.setAmountSupport(amountDao.selectAmountSupport(empNo));
		
		// 사용 비용
		staffDto.setUseAmount(amountDao.selectUseAmount(empNo));
		
		// 워케이션 진행 여부
		staffDto.setWorkcation(workcationDao.existsWorkcation(empNo));
		
		// 나의 워케이션 업무계획
		staffDto.setWorkcationPlan(workcationDao.selectWorkcationPlan(empNo));
		
		// 업무 진행률
		staffDto.setProgressRate(taskDao.selectProgressRate(empNo));
		
		// 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0);
		map.put("limit", 3);
		staffDto.setNoticeData(noticeDao.selectNoticeList(sqlSession, map));
				
		return staffDto;
	}

}
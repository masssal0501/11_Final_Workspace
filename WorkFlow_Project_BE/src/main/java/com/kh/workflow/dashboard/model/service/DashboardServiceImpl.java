package com.kh.workflow.dashboard.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.workflow.amount.dao.AmountDao;
import com.kh.workflow.attendance.model.dao.AttendanceDao;
import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.CurrentHubDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.ReservationListDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.employee.model.dao.EmployeeDao;
import com.kh.workflow.hub.model.dao.HubDao;
import com.kh.workflow.notice.service.NoticeService;
import com.kh.workflow.task.model.dao.TaskDao;
import com.kh.workflow.workcation.model.dao.WorkcationDao;

/**
 * 대시보드 비즈니스 로직 구현체
 * 여러 도메인의 DAO를 호출하여 
 * 직급별 대시보드 화면에 필요한 데이터를 하나의 DTO로 취합합니다.
 */
@Service
public class DashboardServiceImpl implements DashboardService {

	@Autowired
	private WorkcationDao workcationDao;
	
	@Autowired
	private HubDao hubDao;
	
	@Autowired
	private AmountDao amountDao;
	
	@Autowired
	private NoticeService noticeService;

	@Autowired
	private EmployeeDao employeeDao;

	@Autowired
	private TaskDao taskDao;

	@Autowired
	private AttendanceDao attendanceDao;

	/**
	 * [관리자] 전사 대시보드 데이터 조회
	 */
	@Override
	public AdminDto selectAdminDashboard() {
		AdminDto adminDto = new AdminDto();
		
		/* --- [1] 상단 요약 지표 (이번 달 기준) --- */
		adminDto.setTotalApply(workcationDao.adminCountTotalApply());
		adminDto.setWaiting(workcationDao.adminCountWaiting());
		adminDto.setInProgress(workcationDao.adminCountInProgress());
		adminDto.setBudgetExhaustionRate(amountDao.adminSelectBudgetExhaustionRate());
		
		/* --- [2] 전체 누적 통계 지표 --- */
		adminDto.setTotalParticipants(workcationDao.countTotalParticipants());
		adminDto.setTotalBudget(amountDao.selectTotalBudget());
		adminDto.setAvgSatisfaction(workcationDao.selectAvgSatisfaction());
		adminDto.setAvgDuration(workcationDao.selectAvgDuration());
		adminDto.setSupportFund(amountDao.selectSupportFund());
		adminDto.setUsageRate(workcationDao.selectUsageRate());
		adminDto.setTotalCost(amountDao.selectTotalCost());
		
		/* --- [3] 리스트 데이터 --- */
		// 관리자 처리가 필요한 승인대기 목록
		adminDto.setWaitingList(workcationDao.adminSelectWaitingList());
		
		// 메인 화면용 최신 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0);
		map.put("limit", 3);
		adminDto.setNoticeData(noticeService.selectNoticeList(map));
		
		/* --- [4] 차트 시각화용 데이터 --- */
		// 최근 6개월간의 월별 참가 현황 트렌드
		adminDto.setMonthlyData(workcationDao.selectMonthlyData(LocalDateTime.now().minusMonths(6)));
		adminDto.setRegionData(workcationDao.adminSelectRegionData());
		adminDto.setShareData(hubDao.HubShareData());
		adminDto.setBudgetData(amountDao.selectBudgetData());
		adminDto.setCategoryData(amountDao.selectCategoryData());
		adminDto.setDeptData(amountDao.selectDeptData());
		
		return adminDto;
	}

	/**
	 * [부서장] 부서 전용 대시보드 데이터 조회
	 */
	@Override
	public ManagerDto selectManagerDashboard(String depId) {
		ManagerDto managerDto = new ManagerDto();
		
		// 화면에 표시할 부서명 조회
		managerDto.setDepTitle(employeeDao.selectDepTitle(depId));
		
		/* --- [1] 부서별 요약 지표 --- */
		managerDto.setTotalApply(workcationDao.managerCountTotalApply(depId));
		managerDto.setWaiting(workcationDao.managerCountWaiting(depId));
		managerDto.setInProgress(workcationDao.managerCountInProgress(depId));
		managerDto.setBudgetExhaustionRate(amountDao.managerSelectBudgetExhaustionRate(depId));
		managerDto.setAvgProgressRate(taskDao.AvgProgressRate(depId));
		
		/* --- [2] 리스트 및 차트 데이터 --- */
		// 결재 처리를 위한 부서원 승인대기/정산대기 목록
		managerDto.setWaitingList(workcationDao.managerSelectWaitingList(depId));
		managerDto.setBalanceList(amountDao.selectBalanceList(depId));
		
		// 부서원 전체의 워케이션 신청/진행 내역 목록
		managerDto.setWorkcationList(workcationDao.managerSelectWorkcationList(depId));		
		
		// 부서원들이 선호하는 지역별 이용 통계
		managerDto.setRegionData(workcationDao.managerSelectRegionData(depId));
				
		// 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0);
		map.put("limit", 3);
		managerDto.setNoticeData(noticeService.selectNoticeList(map));
		
		return managerDto;
	}

	/**
	 * [부서장] 조건 기반 부서원 워케이션 목록 조회
	 */
	@Override
	public List<WorkcationListDto> selectManagerWorkcationList(String depId, String keyword, LocalDateTime startDate, LocalDateTime endDate) {
		// 동적 쿼리를 통해 키워드와 기간에 일치하는 목록만 필터링하여 반환
		return workcationDao.managerSearchWorkcationList(depId, keyword, startDate, endDate);
	}

	/**
	 * [사원] 개인 대시보드 데이터 조회
	 */
	@Override
	public StaffDto selectStaffDashboard(int empNo) {
		StaffDto staffDto = new StaffDto();
		
		/* --- [1] 개인별 기본 요약 지표 --- */
		staffDto.setWorkcationCount(workcationDao.selectWorkcationCount(empNo));
		staffDto.setAmountSupport(amountDao.selectAmountSupport(empNo));
		staffDto.setUseAmount(amountDao.selectUseAmount(empNo));
		staffDto.setWorkcationIsTrue(workcationDao.existsWorkcation(empNo));
		
		/* --- [2] 업무 및 일정 관리 데이터 --- */
		staffDto.setWorkcationPlan(workcationDao.selectWorkcationPlan(empNo));
		staffDto.setProgressRate(taskDao.selectProgressRate(empNo));
		staffDto.setReservationList(workcationDao.selectReservationList(empNo));
		List<CurrentHubDto> hubList = hubDao.selectHubAddress(empNo);
		if (!hubList.isEmpty()) {
			CurrentHubDto currentHub = hubList.get(0);
			staffDto.setHubAddress(currentHub.getHubAddress());
			staffDto.setCurrentWorkcationNo(currentHub.getWorkcationNo());
			staffDto.setCurrentHubNo(currentHub.getHubNo());

			// 현재 워케이션의 가장 최근 근태 기록으로 출근 상태 판단(새로고침해도 유지)
			attendanceDao.findTopByWorkcation_WorkcationNoOrderByCheckedAtDesc(currentHub.getWorkcationNo())
					.ifPresent(latest -> staffDto.setCheckedIn("IN".equals(latest.getCheckType())));
		}
		
		/* --- [3] 공통 데이터 --- */
		// 공지사항
		Map<String, Object> map = new HashMap<>();
		map.put("offset", 0);
		map.put("limit", 3);
		staffDto.setNoticeData(noticeService.selectNoticeList(map));
				
		return staffDto;
	}

	/**
	 * [사원] 조건 기반 본인 예약 목록 조회
	 */
	@Override
	public List<ReservationListDto> selectStaffReservationList(int empNo, String keyword, LocalDateTime startDate, LocalDateTime endDate) {
		// 사번(empNo)을 고정값으로 두고 키워드와 기간으로 개인 예약 일정 필터링
		return workcationDao.staffSearchReservationList(empNo, keyword, startDate, endDate);
	}

}
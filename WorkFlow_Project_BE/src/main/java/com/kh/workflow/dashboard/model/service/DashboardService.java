package com.kh.workflow.dashboard.model.service;

import java.time.LocalDateTime;
import java.util.List;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.reservation.model.vo.Reservation;

/**
 * 대시보드 비즈니스 로직 처리를 위한 서비스 인터페이스
 * 컨트롤러에서 전달받은 데이터를 가공하거나, 
 * 데이터베이스 조회를 호출하여 그 결과를 컨트롤러로 반환하는 역할을 합니다.
 */
public interface DashboardService {

	/**
	 * [관리자용] 대시보드 요약 정보 조회
	 * 회사 전체의 워케이션 통계, 승인 대기 상태 등 최고 관리자에게 필요한 전사적 데이터를 조회합니다.
	 * 
	 * @return AdminDto 전체 대시보드 통계 데이터
	 */
	AdminDto selectAdminDashboard();

	/**
	 * [부서장용] 대시보드 요약 정보 조회
	 * 특정 부서의 워케이션 현황, 부서원들의 진행 상태 등 부서장(Manager) 권한에 맞는 통계 데이터를 조회합니다.
	 * 
	 * @param depId 조회할 부서의 부서 아이디
	 * @return ManagerDto 해당 부서의 대시보드 통계 데이터
	 */
	ManagerDto selectManagerDashboard(String depId);

	/**
	 * [부서장용] 소속 부서원들의 워케이션 목록 검색 조회
	 * 조건을 바탕으로 해당 부서에 속한 사원들의 워케이션 신청 내역을 필터링하여 조회합니다.
	 * 
	 * @param depId 부서 아이디
	 * @param keyword 검색어
	 * @param startDate 검색 범위 시작일자
	 * @param endDate 검색 범위 종료일자
	 * @return List<WorkcationListDto> 조건에 만족하는 워케이션 목록
	 */
	List<WorkcationListDto> selectManagerWorkcationList(String depId, String keyword, LocalDateTime startDate, LocalDateTime endDate);

	/**
	 * [사원용] 개인 대시보드 요약 정보 조회
	 * 로그인한 사원 본인의 워케이션 신청 내역 요약, 남은 연차 등 개인 대시보드 데이터를 조회합니다.
	 * 
	 * @param empNo 조회할 사원의 사원 번호
	 * @return StaffDto 사원 개인의 대시보드 통계 데이터
	 */
	StaffDto selectStaffDashboard(int empNo);

	/**
	 * [사원용] 개인 워케이션 예약 리스트 검색 조회
	 * 사원 본인이 예약한 워케이션 허브(숙소/오피스) 내역을 조건(검색어, 날짜 기간)에 맞춰 필터링하여 조회합니다.
	 * 
	 * @param empNo 사원 번호(사번)
	 * @param keyword 검색어 (예: 지역명, 허브명 등)
	 * @param startDate 검색 범위 시작일자 (시간은 00:00:00 으로 세팅됨)
	 * @param endDate 검색 범위 종료일자 (시간은 23:59:59 로 세팅됨)
	 * @return List<Reservation> 조건에 만족하는 본인의 예약 목록
	 */
	List<Reservation> selectStaffReservationList(int empNo, String keyword, LocalDateTime startDate, LocalDateTime endDate);
	
}
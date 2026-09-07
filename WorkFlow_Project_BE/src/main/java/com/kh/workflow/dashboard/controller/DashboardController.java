package com.kh.workflow.dashboard.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kh.workflow.dashboard.model.dto.AdminDto;
import com.kh.workflow.dashboard.model.dto.ManagerDto;
import com.kh.workflow.dashboard.model.dto.StaffDto;
import com.kh.workflow.dashboard.model.dto.WorkcationListDto;
import com.kh.workflow.dashboard.model.service.DashboardService;
import com.kh.workflow.workcation.model.vo.Reservation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * 대시보드 API 컨트롤러
 * 직급별 대시보드 통계 조회 및 워케이션/예약 목록 검색을 담당합니다.
 */
@Tag(name="Dashboard API", description="직급별 대시보드 조회 관련 API")
@CrossOrigin
@RestController
public class DashboardController {
	
	@Autowired
	private DashboardService dashboardService;
	
	/* =====================================================================
	 * 1. 관리자 전용 API
	 * ===================================================================== */
	@Operation(summary="관리자용 대시보드 조회", description="관리자의 대시보드 정보를 조회합니다.")
	@ApiResponse(responseCode="200", description="조회 성공")
	@SecurityRequirement(name="JWT")
	@GetMapping("/dashboard/admin")
	public ResponseEntity<AdminDto> selectAdminDashboard() {
		// 서비스에서 관리자 권한의 대시보드 데이터를 가져옴
		AdminDto adminDto = dashboardService.selectAdminDashboard();
		// HTTP 200 상태 코드와 함께 데이터를 JSON으로 반환
		return ResponseEntity.status(HttpStatus.OK)
							 .body(adminDto);
	}
	
	/* =====================================================================
	 * 2. 부서장 전용 API
	 * ===================================================================== */
	@Operation(summary="부서장용 대시보드 조회", description="depId로 한명의 부서장의 대시보드 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="조회 성공"),
		@ApiResponse(responseCode="200 (null)", description ="해당 부서번호의 대시보드 정보가 없을 경우 body 가 null 로 응답됨")
	})
	@SecurityRequirement(name="JWT")
	@GetMapping("/dashboard/manager/{depId}")
	// @PathVariable: URL 경로에 포함된 '{depId}' 값을 메서드 파라미터로 추출
	public ResponseEntity<ManagerDto> selectManagerDashboard(@PathVariable String depId) {
		ManagerDto managerDto = dashboardService.selectManagerDashboard(depId);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(managerDto);
	}
	
	@Operation(summary="부서 워케이션 목록 검색 조회", description="키워드 (keyword) 와 기간 범위(startAt, endAt) 에 해당하는 부서 워케이션 목록을 조회합니다.")
	@ApiResponse(responseCode="200", description="조회 성공",
	content=@Content(mediaType="application/json",
	examples=@ExampleObject(value="""
				[{
					"empNo" : 1,
					"workcationTitle" : "업무 집중 및 생산성 향상",
					"mainRegion" : "강원도",
					"subRegion" : "춘천시",
					"startAt" : "2026-09-01T09:00:00",
					"endAt" : "2026-09-05T18:00:00",
					"empName" : "홍길동",
					"status" : "대기"
				}]
	""")))
	@SecurityRequirement(name="JWT")
	@GetMapping("/dashboard/manager/{depId}/workcation")
	public ResponseEntity<List<WorkcationListDto>> selectManagerWorkcationList(@PathVariable String depId,
																			   @RequestParam(required=false) String keyword,
																			   @RequestParam(required=false) @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate startAt,
																			   @RequestParam(required=false) @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate endAt) {
		
		// DB 조회를 위해 LocalDate를 LocalDateTime으로 변환
		// 시작일이 있으면 해당 날짜의 00시 00분 00초로 설정
		LocalDateTime startDate = (startAt != null) ? startAt.atStartOfDay() : null;
	    
		// 종료일이 있으면 해당 날짜의 23시 59분 59초(하루의 끝)로 설정하여 해당 일자 전체가 포함되게 함
		LocalDateTime endDate = (endAt != null) ? endAt.atTime(LocalTime.MAX) : null;
		
		// 변환된 날짜 객체와 키워드를 서비스로 넘겨 데이터베이스 검색 수행
		List<WorkcationListDto> list = dashboardService.selectManagerWorkcationList(depId, keyword, startDate, endDate);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(list);
	}
	
	/* =====================================================================
	 * 3. 사원(Staff) 전용 API
	 * ===================================================================== */
	@Operation(summary="사원용 대시보드 조회", description="empNo로 한명의 사원의 대시보드 정보를 조회합니다.")
	@ApiResponses({
		@ApiResponse(responseCode="200", description="조회 성공"),
		@ApiResponse(responseCode="200 (null)", description ="해당 사번의 대시보드 정보가 없을 경우 body 가 null 로 응답됨")
	})
	@SecurityRequirement(name="JWT")
	@GetMapping("/dashboard/staff/{empNo}")
	public ResponseEntity<StaffDto> selectStaffDashboard(@PathVariable int empNo) {
		StaffDto staffDto = dashboardService.selectStaffDashboard(empNo);
		
		return ResponseEntity.status(HttpStatus.OK)
							 .body(staffDto);
	}
	
	@Operation(summary="예약 리스트 검색 조회", description="키워드 (keyword) 와 기간 범위(startAt, endAt) 에 해당하는 부서 워케이션 목록을 조회합니다.")
	@ApiResponse(responseCode="200", description="조회 성공",
	content=@Content(mediaType="application/json",
	examples=@ExampleObject(value="""
			[{
					"hub" : {},
					"rsvEnd" : "2026-09-05T18:00:00",
					"rsvNo" : 1,
					"rsvStart" : "2026-09-01T09:00:00",
					"rsvStatus" : "N",
					"userCapacity" : "1",
					"workcation" : {}
				}]
	""")))
	@SecurityRequirement(name="JWT")
	@GetMapping("/dashboard/staff/{empNo}/reservation")
	public ResponseEntity<List<Reservation>> selectStaffReservationList(@PathVariable int empNo,
																		@RequestParam(required=false) String keyword,
																		@RequestParam(required=false) @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate startAt,
																		@RequestParam(required=false) @DateTimeFormat(pattern="yyyy-MM-dd") LocalDate endAt) {
		// 부서장 검색 로직과 동일하게 날짜 범위 조건 생성
		LocalDateTime startDate = (startAt != null) ? startAt.atStartOfDay() : null;
	    LocalDateTime endDate = (endAt != null) ? endAt.atTime(LocalTime.MAX) : null;
	    // 사번 기준의 예약 리스트 검색 수행
		List<Reservation> list = dashboardService.selectStaffReservationList(empNo, keyword, startDate, endDate);
		
		return ResponseEntity.status(HttpStatus.OK)
				 			 .body(list);
	}
}
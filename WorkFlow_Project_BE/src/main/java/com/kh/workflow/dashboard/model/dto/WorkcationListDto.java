package com.kh.workflow.dashboard.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 부서 워케이션 목록 조회 및 검색을 위한 응답 DTO
 * 부서장 대시보드 등에서 소속 부서원들의 워케이션 신청 내역 및 상세 정보
 * (신청자, 제목, 지역, 기간, 상태 등)를 담아 화면으로 전달합니다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class WorkcationListDto {

	private int empNo;
	private String workcationTitle;
	private String mainRegion;
	private String subRegion;
	private LocalDateTime startAt;
	private LocalDateTime endAt;
	private String empName;
	private String status;
	
}
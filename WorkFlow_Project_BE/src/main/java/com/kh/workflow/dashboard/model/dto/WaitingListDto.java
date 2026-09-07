package com.kh.workflow.dashboard.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 승인 대기 목록 조회를 위한 응답 DTO
 * 관리자 및 부서장 대시보드 화면에서 승인 대기('W') 상태인 워케이션 신청 건들의 
 * 신청자 정보, 소속 부서, 희망 지역, 기간 및 상태 정보를 담아 전달합니다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class WaitingListDto {
	private String empName;
	private String depTitle;
	private String mainRegion;
	private LocalDateTime startAt;
	private LocalDateTime endAt;
	private String approverState;
}
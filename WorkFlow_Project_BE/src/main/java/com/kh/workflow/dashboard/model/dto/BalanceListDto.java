package com.kh.workflow.dashboard.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 정산 대기 목록 조회를 위한 응답 DTO
 * 부서장 대시보드 등에서 부서원들이 신청한 워케이션 정산 및 비용 관련 내역 정보를 담아 전달합니다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class BalanceListDto {
	private String empName;
	private int empNo;
	private int approvedAmount;
	private String status;
}
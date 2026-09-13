package com.kh.workflow.dashboard.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 정산(비용) 대기 목록 조회를 위한 응답 DTO
 * 부서장 대시보드의 "정산 대기 목록"에서, 아직 최종 처리(승인/취소/반려)되지 않은
 * 부서원의 비용 신청(Amount) 건들의 사번/신청자명/금액/상태/신청일 정보를 담아 전달합니다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class SettlementWaitingDto {
	private int amountNo;
	private int empNo;
	private String empName;
	private Integer requestedAmount;
	private String status;
	private LocalDateTime requestedAt;
}

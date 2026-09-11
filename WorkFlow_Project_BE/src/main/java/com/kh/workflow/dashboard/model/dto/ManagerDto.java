package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 부서장(Manager) 전용 대시보드 응답 DTO
 * 부서장 대시보드 화면에 출력될 부서 기본 정보, 요약 지표(신청 건수, 예산 소진율, 업무 진행률 등), 
 * 승인/정산 대기 목록, 부서원 워케이션 목록 및 각종 통계 데이터를 담아 전달합니다.
 */
@NoArgsConstructor
@Setter
@Getter
@ToString
public class ManagerDto {

	private String depTitle;
	private int totalApply;
	private int waiting;
	private int inProgress;
	private int budgetExhaustionRate;
	private double avgProgressRate;
	
	/* --- 리스트 데이터 --- */
	private List<WaitingListDto> waitingList;
	private List<Notice> noticeData;
	private List<WorkcationListDto> workcationList;
	
	/* --- 시각화 차트용 데이터 (ChartDataDto) --- */
	private List<ChartDataDto> regionData;
}
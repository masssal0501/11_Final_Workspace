package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import com.kh.workflow.notice.vo.Notice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 관리자(Admin) 전용 대시보드 응답 DTO
 * 관리자 대시보드 화면에 출력될 상단 요약 지표, 누적 통계, 승인 대기 목록, 
 * 그리고 각종 시각화 차트(지역별, 월별, 점유율 등) 데이터를 담아 전달합니다.
 */
@NoArgsConstructor
@Setter
@Getter
@ToString
public class AdminDto {
	
	/* --- 상단 요약 지표 (이번 달 기준) --- */
	private int totalApply;
	private int waiting;
	private int inProgress;
	private int budgetExhaustionRate;
	
	/* --- 전사 누적 통계 지표 --- */
	private int usageRate;
	private int totalBudget;
	private double avgSatisfaction;
	private int avgDuration;
	private int supportFund;
	private int totalParticipants;
	private int totalCost;
	private int budgetData;
	
	/* --- 리스트 데이터 --- */
	private List<WaitingListDto> waitingList;
	private List<Notice> noticeData;
	
	/* --- 시각화 차트용 데이터 (ChartDataDto) --- */
	private List<ChartDataDto> regionData;
	private List<ChartDataDto> monthlyData;
	private List<ChartDataDto> shareData;
	private List<ChartDataDto> categoryData;
	private List<ChartDataDto> deptData;
}
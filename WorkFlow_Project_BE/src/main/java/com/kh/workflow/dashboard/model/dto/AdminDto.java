package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@Setter
@Getter
@ToString
public class AdminDto {
	
	private int totalApply;
	private int waiting;
	private int inProgress;
	private int budgetExhaustionRate;
	private int usageRate;
	private int totalParticipants;
	private int totalBudget;
	private double avgSatisfaction;
	private int avgDuration;
	private int supportFund;
	private List<WaitingListDto> waitingList;
	private List<ChartDataDto> monthlyData;
	private List<ChartDataDto> shareData;
	private List<ChartDataDto> categoryData;
	private List<ChartDataDto> deptData;
	private BudgetDataDto budgetData;
}
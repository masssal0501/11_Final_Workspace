package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import com.kh.workflow.notice.vo.Notice;
import com.kh.workflow.workcation.model.vo.WorkcationInfo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
	private List<WaitingListDto> waitingList;
	private List<ChartDataDto> regionData;
	private List<Notice> noticeData;
	private List<BalanceListDto> balanceList;
	private List<WorkcationListDto> workcationList;
}
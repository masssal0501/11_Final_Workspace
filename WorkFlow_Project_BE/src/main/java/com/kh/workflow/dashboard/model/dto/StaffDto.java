package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import com.kh.workflow.notice.vo.Notice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@Setter
@Getter
@ToString
public class StaffDto {

	private int workcationCount;
	private int amountSupport;
	private int useAmount;
	private boolean isWorkcation;
	private String workcationPlan;
	private double progressRate;
	private List<Notice> noticeData;
}
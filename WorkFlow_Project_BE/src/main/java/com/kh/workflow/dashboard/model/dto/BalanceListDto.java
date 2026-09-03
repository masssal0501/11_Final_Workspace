package com.kh.workflow.dashboard.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class BalanceListDto {
	private String empName;
	private String empNo;
	private int approvedAmount;
	private String status;
}
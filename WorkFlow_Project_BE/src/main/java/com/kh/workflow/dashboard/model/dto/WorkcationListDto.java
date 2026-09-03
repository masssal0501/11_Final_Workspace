package com.kh.workflow.dashboard.model.dto;

import java.time.LocalDateTime;

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
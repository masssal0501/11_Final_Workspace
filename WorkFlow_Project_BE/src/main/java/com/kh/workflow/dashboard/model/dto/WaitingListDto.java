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
public class WaitingListDto {
	private String empName;
	private String depTitle;
	private String mainRegion;
	private LocalDateTime startAt;
	private LocalDateTime endAt;
	private String approverState;
}
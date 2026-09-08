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
public class ReservationListDto {

	private int rsvNo;
	private String hubName;
	private LocalDateTime rsvStart;
	private LocalDateTime rsvEnd;
	private int userCapacity;
	private String rsvStatus;
}
package com.kh.workflow.dashboard.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@Setter
@Getter
@ToString
public class BudgetDataDto {
	private int used;
	private int total;
}
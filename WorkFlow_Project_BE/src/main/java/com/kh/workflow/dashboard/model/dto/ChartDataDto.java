package com.kh.workflow.dashboard.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 차트 시각화 데이터 표현을 위한 공통 DTO
 * 대시보드 화면의 파이 차트, 바 차트, 라인 차트 등에서 
 * 항목 이름(라벨)과 수치(값) 데이터를 묶어서 전달하기 위해 사용됩니다.
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@ToString
public class ChartDataDto {
	private String name;
	private double value;
}
package com.kh.workflow.dashboard.model.dto;

import lombok.Getter;
import lombok.ToString;

/**
 * 사원의 "현재 진행 중인 워케이션"이 사용하는 거점 정보.
 * 대시보드의 근태(출근/퇴근) 위치 인증에 필요한 workcationNo/hubNo를
 * hubAddress와 함께 한 번에 조회하기 위한 DTO.
 */
@Getter
@ToString
public class CurrentHubDto {

	private final Integer workcationNo;
	private final Integer hubNo;
	private final String hubAddress;

	public CurrentHubDto(Integer workcationNo, Integer hubNo, String hubAddress) {
		this.workcationNo = workcationNo;
		this.hubNo = hubNo;
		this.hubAddress = hubAddress;
	}
}

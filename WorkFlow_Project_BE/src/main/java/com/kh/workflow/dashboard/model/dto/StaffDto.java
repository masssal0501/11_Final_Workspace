package com.kh.workflow.dashboard.model.dto;

import java.util.List;

import com.kh.workflow.notice.vo.Notice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 사원(Staff) 전용 대시보드 응답 DTO
 * 사원 개인 대시보드 화면에 출력될 기본 요약 지표(이용 횟수, 지원금 잔액, 사용 비용), 
 * 현재 워케이션 진행 여부 및 업무 계획, 진행률, 공지사항, 개인 예약 일정 리스트 데이터를 담아 전달합니다.
 */
@NoArgsConstructor
@Setter
@Getter
@ToString
public class StaffDto {

	private int workcationCount;
	private int amountSupport;
	private int useAmount;
	private boolean WorkcationIsTrue;
	private String workcationPlan;
	private double progressRate;
	private String hubAddress;
	// 근태(출근/퇴근) 체크에 필요 - 현재 진행 중인 워케이션/거점 번호
	private Integer currentWorkcationNo;
	private Integer currentHubNo;
	// 현재 출근 상태(가장 최근 근태 기록이 IN이면 true) - 새로고침해도 유지되도록 서버에서 계산
	private boolean checkedIn;
	
	/* --- 리스트 데이터 --- */
	private List<Notice> noticeData;
	private List<ReservationListDto> reservationList;
}
package com.kh.workflow.reservation.model.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationCreateRequest {

    /**
     * 예약 시작일시
     */
    private LocalDateTime rsvStart;

    /**
     * 예약 종료일시
     */
    private LocalDateTime rsvEnd;

    /**
     * 이용 인원
     */
    private Integer userCapacity;

    /**
     * 워케이션 PK
     */
    private Integer workcationNo;

    /**
     * 거점 PK
     */
    private Integer hubNo;
}